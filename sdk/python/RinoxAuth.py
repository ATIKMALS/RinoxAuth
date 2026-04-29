"""
RinoxAuth Python SDK
Modern licensing + authentication platform
"""

import json
import platform
import subprocess
import uuid
from typing import Optional, Dict, Any

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    raise


class UserInfo:
    """User information returned by the API"""
    
    def __init__(self, data: Dict[str, Any]):
        self.username: str = data.get("username", "")
        self.expiry: str = data.get("expiry", "")
        self.hwid: str = data.get("hwid", "")
        self.plan: str = data.get("plan", "free")
        self.role: str = data.get("role", "user")
    
    def is_expired(self) -> bool:
        """Check if user subscription has expired"""
        if not self.expiry or self.expiry in ("never", "Never", "N/A"):
            return False
        try:
            from datetime import datetime
            expiry_date = datetime.strptime(self.expiry[:10], "%Y-%m-%d")
            return expiry_date < datetime.now()
        except:
            return False
    
    def days_remaining(self) -> int:
        """Get days remaining until expiry"""
        if not self.expiry or self.expiry in ("never", "Never", "N/A"):
            return 999
        try:
            from datetime import datetime
            expiry_date = datetime.strptime(self.expiry[:10], "%Y-%m-%d")
            return (expiry_date - datetime.now()).days
        except:
            return 0
    
    def __repr__(self):
        return f"UserInfo(username={self.username}, plan={self.plan}, expiry={self.expiry})"


class AuthClient:
    """
    RinoxAuth Client for Python applications
    
    Usage:
        client = AuthClient(
            appName="atik",
            ownerIdOrAppKey="04fad000",
            secret="your-app-secret",
            version="1.0.0",
            apiBaseUrl="http://127.0.0.1:8000"
        )
        
        if client.init():
            if client.login("username", "password"):
                print("Login success!")
    """
    
    def __init__(
        self,
        appName: str,
        ownerIdOrAppKey: str,
        secret: str,
        version: str = "1.0.0",
        apiBaseUrl: str = "http://127.0.0.1:8000"
    ):
        """
        Initialize AuthClient
        
        Args:
            appName: Application name (from dashboard)
            ownerIdOrAppKey: Owner ID (from credentials)
            secret: App Secret (from credentials)
            version: App version (e.g., "1.0.0")
            apiBaseUrl: Backend URL (e.g., "http://127.0.0.1:8000")
        """
        self._app_name = appName
        self._owner_id = ownerIdOrAppKey
        self._secret = secret
        self._version = version
        self._api_url = apiBaseUrl.rstrip('/') + "/api/auth"
        
        # Results
        self.is_success: bool = False
        self.message: str = ""
        self.user: Optional[UserInfo] = None
        self.token: Optional[str] = None
    
    # ============================================
    # INIT
    # ============================================
    def init(self) -> bool:
        """Initialize connection and check credentials"""
        payload = {
            "type": "init",
            "appname": self._app_name,
            "ownerid": self._owner_id,
            "secret": self._secret,
            "version": self._version
        }
        self._send(payload)
        return self.is_success
    
    # ============================================
    # LOGIN (Username + Password)
    # ============================================
    def login(self, username: str, password: str) -> bool:
        """Login with username and password"""
        payload = {
            "type": "login",
            "appname": self._app_name,
            "ownerid": self._owner_id,
            "secret": self._secret,
            "username": username,
            "password": password,
            "hwid": self._get_hwid()
        }
        self._send(payload)
        return self.is_success
    
    # ============================================
    # LICENSE VALIDATION
    # ============================================
    def license(self, key: str) -> bool:
        """Validate a license key"""
        payload = {
            "type": "license",
            "appname": self._app_name,
            "ownerid": self._owner_id,
            "secret": self._secret,
            "key": key,
            "hwid": self._get_hwid()
        }
        self._send(payload)
        return self.is_success
    
    def validate_license(self, key: str) -> bool:
        """Alias for license()"""
        return self.license(key)
    
    # ============================================
    # LICENSE LOGIN (No username/password needed)
    # ============================================
    def license_login(self, key: str) -> bool:
        """Login using only a license key"""
        payload = {
            "type": "license-login",
            "appname": self._app_name,
            "ownerid": self._owner_id,
            "secret": self._secret,
            "key": key,
            "hwid": self._get_hwid()
        }
        self._send(payload)
        return self.is_success
    
    # ============================================
    # QUICK LICENSE LOGIN
    # ============================================
    def quick_license_login(self, key: str) -> bool:
        """
        One-call license login
        Tries license-login first, then falls back to validate + login
        """
        # First try license-login
        if self.license_login(key):
            return True
        
        # If fails, validate then login
        if self.license(key):
            username = "user_" + key.replace("-", "")[:8]
            return self.login(username, key)
        
        return False
    
    # ============================================
    # REGISTER
    # ============================================
    def register(self, username: str, password: str, license_key: Optional[str] = None) -> bool:
        """Register a new user account"""
        payload = {
            "type": "register",
            "appname": self._app_name,
            "ownerid": self._owner_id,
            "secret": self._secret,
            "username": username,
            "password": password,
            "hwid": self._get_hwid()
        }
        
        if license_key:
            payload["key"] = license_key
        
        self._send(payload)
        return self.is_success
    
    # ============================================
    # CORE SEND METHOD
    # ============================================
    def _send(self, payload: Dict[str, Any]) -> None:
        """Send request to API"""
        try:
            response = requests.post(
                self._api_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            data = response.json()
            
            self.is_success = data.get("success", False)
            self.message = data.get("message", "")
            self.token = data.get("token")
            
            # Parse user info
            user_data = data.get("user") or data.get("data", {}).get("user")
            if user_data:
                self.user = UserInfo(user_data)
            else:
                self.user = None
                
        except requests.exceptions.ConnectionError:
            self.is_success = False
            self.message = "Connection failed. Is the server running?"
            self.user = None
            self.token = None
        except requests.exceptions.Timeout:
            self.is_success = False
            self.message = "Request timed out"
            self.user = None
            self.token = None
        except Exception as e:
            self.is_success = False
            self.message = str(e)
            self.user = None
            self.token = None
    
    # ============================================
    # GET HWID
    # ============================================
    @staticmethod
    def _get_hwid() -> str:
        """Get unique hardware ID"""
        try:
            # Try CPU serial
            if platform.system() == "Windows":
                result = subprocess.run(
                    ["wmic", "cpu", "get", "ProcessorId"],
                    capture_output=True, text=True
                )
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    cpu_id = lines[1].strip()
                    if cpu_id and cpu_id != "0000000000000000":
                        return cpu_id
            else:
                # Linux/Mac
                result = subprocess.run(
                    ["cat", "/proc/cpuinfo"],
                    capture_output=True, text=True
                )
                for line in result.stdout.split('\n'):
                    if "Serial" in line:
                        return line.split(":")[1].strip()
        except:
            pass
        
        # Fallback: Machine UUID
        try:
            return str(uuid.getnode())
        except:
            pass
        
        # Ultimate fallback
        return f"{platform.node()}_{platform.machine()}"