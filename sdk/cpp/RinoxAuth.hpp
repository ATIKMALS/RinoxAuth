/*
 * RinoxAuth C++ SDK
 * Modern licensing + authentication platform
 */

#ifndef RINOXAUTH_HPP
#define RINOXAUTH_HPP

#include <string>
#include <map>
#include <functional>
#include <memory>

#ifdef _WIN32
    #include <windows.h>
    #pragma comment(lib, "winhttp.lib")
#endif

// JSON library - nlohmann/json (header-only)
// Download from: https://github.com/nlohmann/json/releases
// Or install: vcpkg install nlohmann-json
#include <nlohmann/json.hpp>
using json = nlohmann::json;

namespace RinoxAuth {

// ============================================
// USER INFO
// ============================================
class UserInfo {
public:
    std::string username;
    std::string expiry;
    std::string hwid;
    std::string plan;
    std::string role;

    UserInfo() = default;
    UserInfo(const json& data);

    bool IsExpired() const;
    int DaysRemaining() const;
    std::string ToString() const;
};

// ============================================
// HTTP RESPONSE
// ============================================
struct HttpResponse {
    int statusCode;
    std::string body;
    bool success;
};

// ============================================
// AUTH CLIENT
// ============================================
class AuthClient {
public:
    // Properties
    bool IsSuccess;
    std::string Message;
    std::shared_ptr<UserInfo> User;
    std::string Token;

    // Constructor
    AuthClient(
        const std::string& appName,
        const std::string& ownerIdOrAppKey,
        const std::string& secret,
        const std::string& version = "1.0.0",
        const std::string& apiBaseUrl = "http://127.0.0.1:8000"
    );

    // Core methods
    bool Init();
    bool Login(const std::string& username, const std::string& password);
    bool License(const std::string& key);
    bool ValidateLicense(const std::string& key);
    bool LicenseLogin(const std::string& key);
    bool QuickLicenseLogin(const std::string& key);
    bool Register(const std::string& username, const std::string& password, const std::string& licenseKey = "");

private:
    std::string m_appName;
    std::string m_ownerId;
    std::string m_secret;
    std::string m_version;
    std::string m_apiUrl;

    void SendRequest(const std::map<std::string, std::string>& payload);
    static std::string GetHwid();
    static HttpResponse HttpPost(const std::string& url, const std::string& body);
    static size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp);
};

} // namespace RinoxAuth

#endif // RINOXAUTH_HPP