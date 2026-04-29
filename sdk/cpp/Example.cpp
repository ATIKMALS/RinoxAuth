/*
 * RinoxAuth C++ Example
 * Shows all login methods
 */

#include <iostream>
#include <string>
#include <limits>
#include "RinoxAuth.hpp"

using namespace RinoxAuth;

// ============================================
// CONFIGURATION
// ============================================
const std::string APP_NAME = "atik";
const std::string OWNER_ID = "04fad000";
const std::string APP_SECRET = "02f70ade4635008aa47f4522ef58a69e98654c3ebf25494ef7d9f9b5b6272b6b";
const std::string VERSION = "1.0.0";
const std::string API_URL = "http://127.0.0.1:8000";

// ============================================
// HELPERS
// ============================================
std::string ReadPassword() {
    std::string password;
    char ch;
    while ((ch = getchar()) != '\n') {
        if (ch == '\b' && !password.empty()) {
            password.pop_back();
        } else if (ch != '\b') {
            password += ch;
        }
    }
    return password;
}

void PrintUserInfo(AuthClient& client) {
    if (client.User) {
        std::cout << std::endl;
        std::cout << "🔥 Login Successful!" << std::endl;
        std::cout << "   Username:   " << client.User->username << std::endl;
        std::cout << "   Plan:       " << client.User->plan << std::endl;
        std::cout << "   Expires:    " << client.User->expiry << std::endl;
        std::cout << "   HWID:       " << client.User->hwid << std::endl;
        std::cout << "   Days Left:  " << client.User->DaysRemaining() << std::endl;
        std::cout << "   Is Expired: " << (client.User->IsExpired() ? "Yes" : "No") << std::endl;
    }
}

// ============================================
// LOGIN METHODS
// ============================================
void UsernamePasswordLogin(AuthClient& client) {
    std::string username, password;
    
    std::cout << std::endl;
    std::cout << "--- Username & Password Login ---" << std::endl;
    std::cout << "Username: ";
    std::getline(std::cin, username);
    std::cout << "Password: ";
    password = ReadPassword();
    std::cout << std::endl;
    
    std::cout << "Logging in... ";
    
    if (client.Login(username, password)) {
        std::cout << "✅" << std::endl;
        PrintUserInfo(client);
    } else {
        std::cout << "❌" << std::endl;
        std::cout << "❌ Login Failed: " << client.Message << std::endl;
    }
}

void LicenseKeyLogin(AuthClient& client) {
    std::string licenseKey;
    
    std::cout << std::endl;
    std::cout << "--- License Key Login ---" << std::endl;
    std::cout << "(No username/password needed)" << std::endl;
    std::cout << "License Key: ";
    std::getline(std::cin, licenseKey);
    
    std::cout << "Logging in with license... ";
    
    if (client.QuickLicenseLogin(licenseKey)) {
        std::cout << "✅" << std::endl;
        PrintUserInfo(client);
    } else {
        std::cout << "❌" << std::endl;
        std::cout << "❌ Login Failed: " << client.Message << std::endl;
    }
}

void ValidateLicenseOnly(AuthClient& client) {
    std::string licenseKey;
    
    std::cout << std::endl;
    std::cout << "--- Validate License Only ---" << std::endl;
    std::cout << "License Key: ";
    std::getline(std::cin, licenseKey);
    
    std::cout << "Validating license... ";
    
    if (client.ValidateLicense(licenseKey)) {
        std::cout << "✅" << std::endl;
        std::cout << "✅ License is VALID!" << std::endl;
    } else {
        std::cout << "❌" << std::endl;
        std::cout << "❌ Invalid License: " << client.Message << std::endl;
    }
}

void RegisterAccount(AuthClient& client) {
    std::string username, password, licenseKey;
    
    std::cout << std::endl;
    std::cout << "--- Register New Account ---" << std::endl;
    std::cout << "Username: ";
    std::getline(std::cin, username);
    std::cout << "Password: ";
    password = ReadPassword();
    std::cout << std::endl;
    std::cout << "License Key (optional, press Enter to skip): ";
    std::getline(std::cin, licenseKey);
    
    std::cout << "Registering... ";
    
    if (client.Register(username, password, licenseKey)) {
        std::cout << "✅" << std::endl;
        std::cout << "✅ Registration Successful!" << std::endl;
    } else {
        std::cout << "❌" << std::endl;
        std::cout << "❌ Registration Failed: " << client.Message << std::endl;
    }
}

// ============================================
// MAIN
// ============================================
int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  RinoxAuth - C++ Example" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << std::endl;
    
    // Initialize client
    AuthClient client(APP_NAME, OWNER_ID, APP_SECRET, VERSION, API_URL);
    
    std::cout << "Connecting to server... ";
    if (!client.Init()) {
        std::cout << "❌" << std::endl;
        std::cout << "❌ Connection failed: " << client.Message << std::endl;
        std::cout << "Make sure backend is running at " << API_URL << std::endl;
        return 1;
    }
    std::cout << "✅" << std::endl;
    std::cout << "✅ Connected to RinoxAuth server!" << std::endl;
    
    // Main loop
    while (true) {
        std::cout << std::endl;
        std::cout << "Select login method:" << std::endl;
        std::cout << "  1. Username & Password Login" << std::endl;
        std::cout << "  2. License Key Login" << std::endl;
        std::cout << "  3. Validate License Only" << std::endl;
        std::cout << "  4. Register New Account" << std::endl;
        std::cout << "  5. Exit" << std::endl;
        std::cout << std::endl;
        std::cout << "Enter choice (1-5): ";
        
        std::string choice;
        std::getline(std::cin, choice);
        
        if (choice == "1") {
            UsernamePasswordLogin(client);
        } else if (choice == "2") {
            LicenseKeyLogin(client);
        } else if (choice == "3") {
            ValidateLicenseOnly(client);
        } else if (choice == "4") {
            RegisterAccount(client);
        } else if (choice == "5") {
            std::cout << "Goodbye! 👋" << std::endl;
            break;
        } else {
            std::cout << "Invalid choice! Try again." << std::endl;
        }
        
        std::cout << std::endl;
        std::cout << "Press Enter to continue...";
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
#ifdef _WIN32
        system("cls");
#else
        system("clear");
#endif
    }
    
    return 0;
}