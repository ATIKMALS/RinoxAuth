"""
RinoxAuth Python Example
Shows all login methods: username/password, license key, register
"""

import sys
import os
from getpass import getpass
from RinoxAuth import AuthClient

# ============================================
# CONFIGURATION
# ============================================
APP_NAME = "atik"
OWNER_ID = "04fad000"      # Your Owner ID from dashboard
APP_SECRET = "02f70ade4635008aa47f4522ef58a69e98654c3ebf25494ef7d9f9b5b6272b6b"  # Your App Secret
VERSION = "1.0.0"
API_URL = "http://127.0.0.1:8000"

# ============================================
# INITIALIZE CLIENT
# ============================================
client = AuthClient(
    appName=APP_NAME,
    ownerIdOrAppKey=OWNER_ID,
    secret=APP_SECRET,
    version=VERSION,
    apiBaseUrl=API_URL
)


def print_banner():
    """Print application banner"""
    print("=" * 50)
    print("  RinoxAuth - Python Example")
    print("=" * 50)
    print()


def print_user_info(client: AuthClient):
    """Print user information after login"""
    if client.user:
        print()
        print("🔥 Login Successful!")
        print(f"   Username:   {client.user.username}")
        print(f"   Plan:       {client.user.plan}")
        print(f"   Expires:    {client.user.expiry}")
        print(f"   HWID:       {client.user.hwid}")
        print(f"   Days Left:  {client.user.days_remaining()}")
        print(f"   Is Expired: {client.user.is_expired()}")
        print(f"   Token:      {client.token[:30] if client.token else 'N/A'}...")


def username_password_login():
    """Login with username and password"""
    print()
    print("--- 1. Username & Password Login ---")
    
    username = input("Username: ").strip()
    password = getpass("Password: ")
    
    if not username or not password:
        print("❌ Username and password are required!")
        return
    
    print("Logging in...", end=" ")
    
    if client.login(username, password):
        print("✅")
        print_user_info(client)
    else:
        print("❌")
        print(f"❌ Login Failed: {client.message}")


def license_key_login():
    """Login with license key only"""
    print()
    print("--- 2. License Key Login ---")
    print("(No username/password needed)")
    
    license_key = input("License Key: ").strip()
    
    if not license_key:
        print("❌ License key is required!")
        return
    
    print("Logging in with license...", end=" ")
    
    if client.quick_license_login(license_key):
        print("✅")
        print_user_info(client)
    else:
        print("❌")
        print(f"❌ Login Failed: {client.message}")


def validate_license_only():
    """Validate license without logging in"""
    print()
    print("--- 3. Validate License Only ---")
    
    license_key = input("License Key: ").strip()
    
    if not license_key:
        print("❌ License key is required!")
        return
    
    print("Validating license...", end=" ")
    
    if client.validate_license(license_key):
        print("✅")
        print("✅ License is VALID!")
        print("   This license can be used to login.")
    else:
        print("❌")
        print(f"❌ Invalid License: {client.message}")


def register_account():
    """Register a new user account"""
    print()
    print("--- 4. Register New Account ---")
    
    username = input("Username: ").strip()
    password = getpass("Password: ")
    license_key = input("License Key (optional, press Enter to skip): ").strip()
    
    if not username or not password:
        print("❌ Username and password are required!")
        return
    
    print("Registering...", end=" ")
    
    key = license_key if license_key else None
    
    if client.register(username, password, key):
        print("✅")
        print("✅ Registration Successful!")
        print("   You can now login with your username and password.")
    else:
        print("❌")
        print(f"❌ Registration Failed: {client.message}")


def show_menu():
    """Display the main menu"""
    print()
    print("Select login method:")
    print("  1. Username & Password Login")
    print("  2. License Key Login (No username/password)")
    print("  3. Validate License Only")
    print("  4. Register New Account")
    print("  5. Exit")
    print()
    return input("Enter choice (1-5): ").strip()


# ============================================
# MAIN
# ============================================
def main():
    print_banner()
    
    # Init connection
    print("Connecting to server...", end=" ")
    if not client.init():
        print("❌")
        print(f"❌ Connection failed: {client.message}")
        print(f"Make sure backend is running at {API_URL}")
        return
    
    print("✅")
    print(f"✅ Connected to RinoxAuth server!")
    
    # Main loop
    while True:
        choice = show_menu()
        
        if choice == "1":
            username_password_login()
        elif choice == "2":
            license_key_login()
        elif choice == "3":
            validate_license_only()
        elif choice == "4":
            register_account()
        elif choice == "5":
            print("Goodbye! 👋")
            break
        else:
            print("Invalid choice! Try again.")
        
        print()
        input("Press Enter to continue...")
        os.system('cls' if os.name == 'nt' else 'clear')
        print_banner()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nGoodbye! 👋")
        sys.exit(0)