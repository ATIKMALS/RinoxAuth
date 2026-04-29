/*
 * RinoxAuth C++ SDK - Implementation
 */

#include "RinoxAuth.hpp"
#include <iostream>
#include <sstream>
#include <chrono>
#include <iomanip>
#include <cstdlib>

#ifdef _WIN32
    #include <comdef.h>
    #include <Wbemidl.h>
    #pragma comment(lib, "wbemuuid.lib")
#else
    #include <fstream>
    #include <sys/utsname.h>
#endif

// For HTTP requests
#include <curl/curl.h>
#ifdef _WIN32
    #pragma comment(lib, "libcurl.lib")
#endif

namespace RinoxAuth {

// ============================================
// USER INFO IMPLEMENTATION
// ============================================
UserInfo::UserInfo(const json& data) {
    username = data.value("username", "");
    expiry = data.value("expiry", "");
    hwid = data.value("hwid", "");
    plan = data.value("plan", "free");
    role = data.value("role", "user");
}

bool UserInfo::IsExpired() const {
    if (expiry.empty() || expiry == "never" || expiry == "Never" || expiry == "N/A") {
        return false;
    }
    try {
        std::string dateStr = expiry.substr(0, 10); // YYYY-MM-DD
        int year = std::stoi(dateStr.substr(0, 4));
        int month = std::stoi(dateStr.substr(5, 2));
        int day = std::stoi(dateStr.substr(8, 2));
        
        auto now = std::chrono::system_clock::now();
        auto now_time = std::chrono::system_clock::to_time_t(now);
        std::tm* now_tm = std::localtime(&now_time);
        
        int nowYear = now_tm->tm_year + 1900;
        int nowMonth = now_tm->tm_mon + 1;
        int nowDay = now_tm->tm_mday;
        
        if (year < nowYear) return true;
        if (year == nowYear && month < nowMonth) return true;
        if (year == nowYear && month == nowMonth && day <= nowDay) return true;
        
        return false;
    } catch (...) {
        return false;
    }
}

int UserInfo::DaysRemaining() const {
    if (expiry.empty() || expiry == "never" || expiry == "Never" || expiry == "N/A") {
        return 999;
    }
    try {
        std::string dateStr = expiry.substr(0, 10);
        int year = std::stoi(dateStr.substr(0, 4));
        int month = std::stoi(dateStr.substr(5, 2));
        int day = std::stoi(dateStr.substr(8, 2));
        
        auto now = std::chrono::system_clock::now();
        auto now_time = std::chrono::system_clock::to_time_t(now);
        
        std::tm expiry_tm = {};
        expiry_tm.tm_year = year - 1900;
        expiry_tm.tm_mon = month - 1;
        expiry_tm.tm_mday = day;
        
        auto expiry_time = std::mktime(&expiry_tm);
        auto diff = std::difftime(expiry_time, now_time);
        
        return static_cast<int>(diff / (60 * 60 * 24));
    } catch (...) {
        return 0;
    }
}

std::string UserInfo::ToString() const {
    std::ostringstream oss;
    oss << "UserInfo(username=" << username 
        << ", plan=" << plan 
        << ", expiry=" << expiry 
        << ", hwid=" << hwid << ")";
    return oss.str();
}

// ============================================
// AUTH CLIENT IMPLEMENTATION
// ============================================
AuthClient::AuthClient(
    const std::string& appName,
    const std::string& ownerIdOrAppKey,
    const std::string& secret,
    const std::string& version,
    const std::string& apiBaseUrl
)
    : IsSuccess(false)
    , Message("")
    , User(nullptr)
    , Token("")
    , m_appName(appName)
    , m_ownerId(ownerIdOrAppKey)
    , m_secret(secret)
    , m_version(version)
    , m_apiUrl(apiBaseUrl)
{
    // Remove trailing slash
    if (!m_apiUrl.empty() && m_apiUrl.back() == '/') {
        m_apiUrl.pop_back();
    }
    m_apiUrl += "/api/auth";
}

// ============================================
// INIT
// ============================================
bool AuthClient::Init() {
    std::map<std::string, std::string> payload = {
        {"type", "init"},
        {"appname", m_appName},
        {"ownerid", m_ownerId},
        {"secret", m_secret},
        {"version", m_version}
    };
    SendRequest(payload);
    return IsSuccess;
}

// ============================================
// LOGIN (Username + Password)
// ============================================
bool AuthClient::Login(const std::string& username, const std::string& password) {
    std::map<std::string, std::string> payload = {
        {"type", "login"},
        {"appname", m_appName},
        {"ownerid", m_ownerId},
        {"secret", m_secret},
        {"username", username},
        {"password", password},
        {"hwid", GetHwid()}
    };
    SendRequest(payload);
    return IsSuccess;
}

// ============================================
// LICENSE VALIDATION
// ============================================
bool AuthClient::License(const std::string& key) {
    std::map<std::string, std::string> payload = {
        {"type", "license"},
        {"appname", m_appName},
        {"ownerid", m_ownerId},
        {"secret", m_secret},
        {"key", key},
        {"hwid", GetHwid()}
    };
    SendRequest(payload);
    return IsSuccess;
}

bool AuthClient::ValidateLicense(const std::string& key) {
    return License(key);
}

// ============================================
// LICENSE LOGIN
// ============================================
bool AuthClient::LicenseLogin(const std::string& key) {
    std::map<std::string, std::string> payload = {
        {"type", "license-login"},
        {"appname", m_appName},
        {"ownerid", m_ownerId},
        {"secret", m_secret},
        {"key", key},
        {"hwid", GetHwid()}
    };
    SendRequest(payload);
    return IsSuccess;
}

// ============================================
// QUICK LICENSE LOGIN
// ============================================
bool AuthClient::QuickLicenseLogin(const std::string& key) {
    // Try license-login first
    if (LicenseLogin(key)) {
        return true;
    }
    
    // If fails, validate then login
    if (License(key)) {
        std::string username = "user_" + key.substr(0, std::min<size_t>(8, key.length()));
        // Remove dashes
        size_t pos;
        while ((pos = username.find('-')) != std::string::npos) {
            username.erase(pos, 1);
        }
        return Login(username, key);
    }
    
    return false;
}

// ============================================
// REGISTER
// ============================================
bool AuthClient::Register(const std::string& username, const std::string& password, const std::string& licenseKey) {
    std::map<std::string, std::string> payload = {
        {"type", "register"},
        {"appname", m_appName},
        {"ownerid", m_ownerId},
        {"secret", m_secret},
        {"username", username},
        {"password", password},
        {"hwid", GetHwid()}
    };
    
    if (!licenseKey.empty()) {
        payload["key"] = licenseKey;
    }
    
    SendRequest(payload);
    return IsSuccess;
}

// ============================================
// SEND REQUEST
// ============================================
void AuthClient::SendRequest(const std::map<std::string, std::string>& payload) {
    try {
        // Build JSON
        json jsonPayload;
        for (const auto& pair : payload) {
            jsonPayload[pair.first] = pair.second;
        }
        
        std::string jsonStr = jsonPayload.dump();
        std::string url = m_apiUrl;
        
        // Send HTTP POST
        HttpResponse response = HttpPost(url, jsonStr);
        
        if (!response.success) {
            IsSuccess = false;
            Message = "Connection failed. Is the server running?";
            User = nullptr;
            Token = "";
            return;
        }
        
        // Parse response
        json data = json::parse(response.body);
        
        IsSuccess = data.value("success", false);
        Message = data.value("message", "");
        Token = data.value("token", "");
        
        // Parse user info
        if (data.contains("user") && !data["user"].is_null()) {
            User = std::make_shared<UserInfo>(data["user"]);
        } else {
            User = nullptr;
        }
        
    } catch (const json::parse_error& e) {
        IsSuccess = false;
        Message = "JSON parse error: " + std::string(e.what());
        User = nullptr;
        Token = "";
    } catch (const std::exception& e) {
        IsSuccess = false;
        Message = std::string("Error: ") + e.what();
        User = nullptr;
        Token = "";
    }
}

// ============================================
// GET HWID
// ============================================
std::string AuthClient::GetHwid() {
#ifdef _WIN32
    try {
        // Get CPU ID on Windows
        HRESULT hres;
        
        hres = CoInitializeEx(0, COINIT_MULTITHREADED);
        if (FAILED(hres)) return "WINDOWS_PC";
        
        IWbemLocator* pLoc = NULL;
        hres = CoCreateInstance(CLSID_WbemLocator, 0, CLSCTX_INPROC_SERVER, IID_IWbemLocator, (LPVOID*)&pLoc);
        if (FAILED(hres)) { CoUninitialize(); return "WINDOWS_PC"; }
        
        IWbemServices* pSvc = NULL;
        hres = pLoc->ConnectServer(_bstr_t(L"ROOT\\CIMV2"), NULL, NULL, 0, NULL, 0, 0, &pSvc);
        if (FAILED(hres)) { pLoc->Release(); CoUninitialize(); return "WINDOWS_PC"; }
        
        hres = CoSetProxyBlanket(pSvc, RPC_C_AUTHN_WINNT, RPC_C_AUTHZ_NONE, NULL, RPC_C_AUTHN_LEVEL_CALL, RPC_C_IMP_LEVEL_IMPERSONATE, NULL, EOAC_NONE);
        if (FAILED(hres)) { pSvc->Release(); pLoc->Release(); CoUninitialize(); return "WINDOWS_PC"; }
        
        IEnumWbemClassObject* pEnumerator = NULL;
        hres = pSvc->ExecQuery(bstr_t("WQL"), bstr_t("SELECT ProcessorId FROM Win32_Processor"),
            WBEM_FLAG_FORWARD_ONLY | WBEM_FLAG_RETURN_IMMEDIATELY, NULL, &pEnumerator);
        
        if (SUCCEEDED(hres)) {
            IWbemClassObject* pclsObj = NULL;
            ULONG uReturn = 0;
            
            while (pEnumerator) {
                HRESULT hr = pEnumerator->Next(WBEM_INFINITE, 1, &pclsObj, &uReturn);
                if (0 == uReturn) break;
                
                VARIANT vtProp;
                hr = pclsObj->Get(L"ProcessorId", 0, &vtProp, 0, 0);
                if (SUCCEEDED(hr)) {
                    std::string cpuId = _bstr_t(vtProp.bstrVal);
                    VariantClear(&vtProp);
                    pclsObj->Release();
                    pEnumerator->Release();
                    pSvc->Release();
                    pLoc->Release();
                    CoUninitialize();
                    
                    if (!cpuId.empty() && cpuId != "0000000000000000") {
                        return cpuId;
                    }
                }
                pclsObj->Release();
            }
        }
        
        pSvc->Release();
        pLoc->Release();
        CoUninitialize();
    } catch (...) {}
    
    return "WINDOWS_PC";
#else
    // Linux/Mac
    try {
        std::ifstream cpuinfo("/proc/cpuinfo");
        std::string line;
        while (std::getline(cpuinfo, line)) {
            if (line.find("Serial") != std::string::npos) {
                size_t pos = line.find(":");
                if (pos != std::string::npos) {
                    std::string serial = line.substr(pos + 1);
                    // Trim
                    serial.erase(0, serial.find_first_not_of(" \t"));
                    serial.erase(serial.find_last_not_of(" \t") + 1);
                    return serial;
                }
            }
        }
    } catch (...) {}
    
    struct utsname name;
    if (uname(&name) == 0) {
        return std::string(name.nodename) + "_" + std::string(name.machine);
    }
    
    return "LINUX_PC";
#endif
}

// ============================================
// HTTP POST
// ============================================
size_t AuthClient::WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

HttpResponse AuthClient::HttpPost(const std::string& url, const std::string& body) {
    HttpResponse response;
    response.success = false;
    response.statusCode = 0;
    
    CURL* curl = curl_easy_init();
    if (!curl) {
        response.body = "Failed to initialize CURL";
        return response;
    }
    
    std::string responseBody;
    struct curl_slist* headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
    curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, (long)body.length());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &responseBody);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
    
    CURLcode res = curl_easy_perform(curl);
    
    if (res == CURLE_OK) {
        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response.statusCode);
        response.body = responseBody;
        response.success = true;
    } else {
        response.body = std::string("CURL error: ") + curl_easy_strerror(res);
    }
    
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    
    return response;
}

} // namespace RinoxAuth