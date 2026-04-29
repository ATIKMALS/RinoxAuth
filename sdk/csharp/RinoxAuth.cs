using System;
using System.Collections.Generic;
using System.Management;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace RinoxAuth
{
    // ============================================
    // ENUMS FOR TYPE SAFETY
    // ============================================
    public enum AuthType
    {
        Init,
        Login,
        License,
        LicenseLogin,
        Register,
        ValidateLicense,
        RefreshToken,
        ResetHwid
    }

    public enum AuthStatus
    {
        Success,
        Failed,
        Error,
        Timeout,
        InvalidLicense,
        Expired,
        HwidMismatch,
        AlreadyUsed,
        Banned,
        Maintenance,
        Unknown
    }

    // ============================================
    // AUTH RESULT CLASS
    // ============================================
    public class AuthResult
    {
        public bool IsSuccess { get; set; }
        public AuthStatus Status { get; set; }
        public string Message { get; set; }
        public UserInfo User { get; set; }
        public string Token { get; set; }
        public string RawResponse { get; set; }
        public int HttpStatusCode { get; set; }
        public DateTime Timestamp { get; set; }

        public AuthResult()
        {
            Timestamp = DateTime.Now;
            Status = AuthStatus.Unknown;
        }

        public override string ToString()
        {
            string username = User != null ? User.username : "N/A";
            return "[" + Status + "] " + Message + " | User: " + username + " | Success: " + IsSuccess;
        }
    }

    // ============================================
    // MAIN AUTH CLIENT CLASS
    // ============================================
    public class AuthClient
    {
        // Public Properties
        public bool IsSuccess { get; private set; }
        public string Message { get; private set; }
        public UserInfo User { get; private set; }
        public string Token { get; private set; }
        public AuthStatus LastStatus { get; private set; }
        public AuthResult LastResult { get; private set; }

        // Events for logging
        public event Action<string> OnLog;
        public event Action<AuthResult> OnAuthComplete;
        public event Action<string> OnError;

        // Private fields
        private readonly string _apiUrl;
        private readonly string _appName;
        private readonly string _ownerIdOrAppKey;
        private readonly string _secret;
        private readonly string _version;
        private readonly int _timeoutSeconds;
        private readonly bool _enableDebugLog;

        private static HttpClient _http;
        private static readonly object _httpLock = new object();

        // ============================================
        // CONSTRUCTOR
        // ============================================
        public AuthClient(string appName, string ownerIdOrAppKey, string secret, string version, string apiBaseUrl, 
            int timeoutSeconds = 30, bool enableDebugLog = true)
        {
            _appName = appName ?? throw new ArgumentNullException(nameof(appName));
            _ownerIdOrAppKey = ownerIdOrAppKey ?? throw new ArgumentNullException(nameof(ownerIdOrAppKey));
            _secret = secret ?? throw new ArgumentNullException(nameof(secret));
            _version = version ?? "1.0";
            _timeoutSeconds = timeoutSeconds;
            _enableDebugLog = enableDebugLog;
            _apiUrl = apiBaseUrl?.TrimEnd('/') + "/api/auth" ?? throw new ArgumentNullException(nameof(apiBaseUrl));

            InitializeHttpClient();
        }

        private void InitializeHttpClient()
        {
            lock (_httpLock)
            {
                if (_http == null)
                {
                    var handler = new HttpClientHandler();
                    handler.AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate;
                    handler.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true;

                    _http = new HttpClient(handler);
                    _http.Timeout = TimeSpan.FromSeconds(_timeoutSeconds);
                    _http.DefaultRequestHeaders.Add("User-Agent", "RinoxAuth/1.0 (" + Environment.OSVersion + ")");
                    _http.DefaultRequestHeaders.Add("Accept", "application/json");
                    _http.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
                }
            }
        }

        // ============================================
        // LOGGING HELPERS
        // ============================================
        private void Log(string message)
        {
            if (_enableDebugLog)
            {
                System.Diagnostics.Debug.WriteLine("[RinoxAuth] " + DateTime.Now.ToString("HH:mm:ss") + " - " + message);
                OnLog?.Invoke(message);
            }
        }

        private void LogError(string message, Exception ex = null)
        {
            string errorMsg = ex != null ? message + ": " + ex.Message : message;
            Log("ERROR: " + errorMsg);
            OnError?.Invoke(errorMsg);
        }

        // ============================================
        // CORE AUTH METHODS (ASYNC)
        // ============================================
        public async Task<AuthResult> InitAsync()
        {
            Log("Initializing connection...");
            var payload = CreateBasePayload("init");
            payload["version"] = _version;
            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> LoginAsync(string username, string password, string twoFactorCode = null)
        {
            if (string.IsNullOrWhiteSpace(username))
                return CreateErrorResult("Username is required");
            if (string.IsNullOrWhiteSpace(password))
                return CreateErrorResult("Password is required");

            Log("Attempting login for user: " + MaskKey(username));

            var payload = CreateBasePayload("login");
            payload["username"] = username;
            payload["password"] = password;
            payload["hwid"] = GetHardwareId();

            if (!string.IsNullOrEmpty(twoFactorCode))
                payload["2fa"] = twoFactorCode;

            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> LicenseAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return CreateErrorResult("License key is required");

            Log("Validating license: " + MaskKey(key));

            var payload = CreateBasePayload("license");
            payload["key"] = key;
            payload["hwid"] = GetHardwareId();

            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> LicenseLoginAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return CreateErrorResult("License key is required");

            Log("License login attempt: " + MaskKey(key));

            var payload = CreateBasePayload("license-login");
            payload["key"] = key;
            payload["hwid"] = GetHardwareId();

            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> QuickLicenseLoginAsync(string key)
        {
            Log("Quick license login: " + MaskKey(key));

            // Try 1: Direct license-login
            var result = await LicenseLoginAsync(key);
            if (result.IsSuccess)
                return result;

            Log("License-login failed (" + result.Message + "), trying alternative methods...");

            // Try 2: Validate license first
            var licenseResult = await LicenseAsync(key);
            if (licenseResult.IsSuccess)
            {
                Log("License valid, attempting login...");
                string username = licenseResult.User?.username ?? GenerateUsernameFromKey(key);
                return await LoginAsync(username, key);
            }

            // Try 3: Auto-registration
            Log("Attempting auto-registration with license...");
            string autoUsername = GenerateUsernameFromKey(key);
            return await RegisterAsync(autoUsername, key, key);
        }

        public async Task<AuthResult> RegisterAsync(string username, string password, string licenseKey = null, string email = null)
        {
            if (string.IsNullOrWhiteSpace(username))
                return CreateErrorResult("Username is required");
            if (string.IsNullOrWhiteSpace(password))
                return CreateErrorResult("Password is required");

            Log("Registering user: " + username);

            var payload = CreateBasePayload("register");
            payload["username"] = username;
            payload["password"] = password;
            payload["hwid"] = GetHardwareId();

            if (!string.IsNullOrEmpty(licenseKey))
                payload["key"] = licenseKey;
            if (!string.IsNullOrEmpty(email))
                payload["email"] = email;

            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> ValidateLicenseAsync(string key)
        {
            return await LicenseAsync(key);
        }

        public async Task<AuthResult> RefreshTokenAsync()
        {
            if (string.IsNullOrEmpty(Token))
                return CreateErrorResult("No token to refresh");

            Log("Refreshing token...");
            var payload = CreateBasePayload("refresh");
            payload["token"] = Token;
            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> ResetHwidAsync(string licenseKey)
        {
            Log("Requesting HWID reset for: " + MaskKey(licenseKey));

            var payload = CreateBasePayload("reset-hwid");
            payload["key"] = licenseKey;
            payload["hwid"] = GetHardwareId();
            payload["new_hwid"] = "RESET";

            return await SendRequestAsync(payload);
        }

        public async Task<AuthResult> PingAsync()
        {
            Log("Pinging server...");
            var payload = CreateBasePayload("ping");
            return await SendRequestAsync(payload);
        }

        // ============================================
        // SYNCHRONOUS WRAPPERS
        // ============================================
        public AuthResult InitSync()
        {
            return RunSync(() => InitAsync());
        }

        public AuthResult LoginSync(string username, string password, string twoFactorCode = null)
        {
            return RunSync(() => LoginAsync(username, password, twoFactorCode));
        }

        public AuthResult LicenseSync(string key)
        {
            return RunSync(() => LicenseAsync(key));
        }

        public AuthResult LicenseLoginSync(string key)
        {
            return RunSync(() => LicenseLoginAsync(key));
        }

        public AuthResult QuickLicenseLoginSync(string key)
        {
            return RunSync(() => QuickLicenseLoginAsync(key));
        }

        public AuthResult RegisterSync(string username, string password, string licenseKey = null, string email = null)
        {
            return RunSync(() => RegisterAsync(username, password, licenseKey, email));
        }

        public AuthResult ValidateLicenseSync(string key)
        {
            return RunSync(() => ValidateLicenseAsync(key));
        }

        public AuthResult ResetHwidSync(string key)
        {
            return RunSync(() => ResetHwidAsync(key));
        }

        public AuthResult PingSync()
        {
            return RunSync(() => PingAsync());
        }

        // Legacy sync methods
        [Obsolete("Use LoginSync instead")]
        public bool Login(string username, string password)
        {
            return LoginSync(username, password).IsSuccess;
        }

        [Obsolete("Use LicenseSync instead")]
        public bool License(string key)
        {
            return LicenseSync(key).IsSuccess;
        }

        [Obsolete("Use QuickLicenseLoginSync instead")]
        public bool QuickLicenseLogin(string key)
        {
            return QuickLicenseLoginSync(key).IsSuccess;
        }

        [Obsolete("Use ValidateLicenseSync instead")]
        public bool ValidateLicense(string key)
        {
            return ValidateLicenseSync(key).IsSuccess;
        }

        [Obsolete("Use InitSync instead")]
        public bool Init()
        {
            return InitSync().IsSuccess;
        }

        // ============================================
        // CORE REQUEST HANDLER
        // ============================================
        private async Task<AuthResult> SendRequestAsync(Dictionary<string, object> payload)
        {
            var result = new AuthResult();
            string requestJson = "";

            try
            {
                var settings = new JsonSerializerSettings();
                settings.NullValueHandling = NullValueHandling.Ignore;
                requestJson = JsonConvert.SerializeObject(payload, Formatting.None, settings);

                Log("Sending: " + payload["type"]);

                using (var content = new StringContent(requestJson, Encoding.UTF8, "application/json"))
                using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_timeoutSeconds)))
                {
                    var response = await _http.PostAsync(_apiUrl, content, cts.Token);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    result.HttpStatusCode = (int)response.StatusCode;
                    result.RawResponse = responseBody;

                    Log("Response [" + response.StatusCode + "]: " + Truncate(responseBody, 200));

                    try
                    {
                        var apiResponse = ParseApiResponse(responseBody);

                        result.IsSuccess = apiResponse.Success;
                        result.Message = apiResponse.Message ?? GetDefaultMessage((int)response.StatusCode);
                        result.User = apiResponse.User;
                        result.Token = apiResponse.Token;
                        result.Status = DetermineStatus(apiResponse, responseBody, (int)response.StatusCode);
                    }
                    catch (JsonException)
                    {
                        result.Message = TryExtractMessage(responseBody);
                        result.IsSuccess = response.IsSuccessStatusCode;
                        if (result.IsSuccess)
                            result.Status = AuthStatus.Success;
                        else
                            result.Status = AuthStatus.Failed;
                    }

                    if (!result.IsSuccess && string.IsNullOrEmpty(result.Message))
                    {
                        result.Message = GetDefaultMessage((int)response.StatusCode);
                    }
                }
            }
            catch (TaskCanceledException)
            {
                result.IsSuccess = false;
                result.Status = AuthStatus.Timeout;
                result.Message = "Request timed out after " + _timeoutSeconds + " seconds";
                LogError("Timeout");
            }
            catch (HttpRequestException ex)
            {
                result.IsSuccess = false;
                result.Status = AuthStatus.Error;
                result.Message = "Connection failed: " + ex.Message;
                LogError("HTTP Error", ex);
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Status = AuthStatus.Error;
                result.Message = "Internal error: " + ex.Message;
                LogError("Unexpected error", ex);
            }

            UpdateFromResult(result);
            LastResult = result;
            OnAuthComplete?.Invoke(result);

            Log("Result: " + result.ToString());
            return result;
        }

        // ============================================
        // RESPONSE PARSING
        // ============================================
        private ApiResponseData ParseApiResponse(string json)
        {
            var data = new ApiResponseData();

            try
            {
                var jObject = JObject.Parse(json);

                // Success field variations
                if (jObject["success"] != null)
                {
                    data.Success = jObject["success"].Value<bool>();
                }
                else if (jObject["status"] != null)
                {
                    data.Success = jObject["status"].ToString().ToLower() == "success";
                }
                else if (jObject["ok"] != null)
                {
                    data.Success = jObject["ok"].Value<bool>();
                }
                else if (jObject["error"] == null || jObject["error"].ToString() == "false")
                {
                    data.Success = true;
                }

                // Message field variations
                if (jObject["message"] != null)
                    data.Message = jObject["message"].ToString();
                else if (jObject["msg"] != null)
                    data.Message = jObject["msg"].ToString();
                else if (jObject["error"] != null)
                    data.Message = jObject["error"].ToString();
                else if (jObject["reason"] != null)
                    data.Message = jObject["reason"].ToString();
                else
                    data.Message = "";

                // User data variations
                var userToken = jObject["user"] ?? jObject["data"] ?? jObject["userinfo"] ?? jObject["account"];
                if (userToken != null)
                {
                    data.User = userToken.ToObject<UserInfo>();
                }

                // Token variations
                if (jObject["token"] != null)
                    data.Token = jObject["token"].ToString();
                else if (jObject["access_token"] != null)
                    data.Token = jObject["access_token"].ToString();
                else if (jObject["auth_token"] != null)
                    data.Token = jObject["auth_token"].ToString();
                else
                    data.Token = "";
            }
            catch
            {
                data.Success = false;
                data.Message = TryExtractMessage(json);
            }

            return data;
        }

        private string TryExtractMessage(string json)
        {
            try
            {
                var patterns = new[] { "\"message\":\"([^\"]+)\"", "\"msg\":\"([^\"]+)\"", "\"error\":\"([^\"]+)\"" };
                foreach (var pattern in patterns)
                {
                    var match = System.Text.RegularExpressions.Regex.Match(json, pattern);
                    if (match.Success)
                        return match.Groups[1].Value;
                }
            }
            catch { }
            return "Unknown response from server";
        }

        private AuthStatus DetermineStatus(ApiResponseData apiResponse, string rawResponse, int httpStatus)
        {
            if (apiResponse.Success)
                return AuthStatus.Success;

            var message = (apiResponse.Message ?? "").ToLower();
            var fullResponse = rawResponse.ToLower();

            if (httpStatus == 401 || httpStatus == 403) return AuthStatus.Banned;
            if (httpStatus == 503) return AuthStatus.Maintenance;
            if (message.Contains("expire") || fullResponse.Contains("expire")) return AuthStatus.Expired;
            if (message.Contains("hwid") || fullResponse.Contains("hwid")) return AuthStatus.HwidMismatch;
            if (message.Contains("already") || fullResponse.Contains("already")) return AuthStatus.AlreadyUsed;
            if (message.Contains("ban") || fullResponse.Contains("ban")) return AuthStatus.Banned;
            if (message.Contains("invalid") || fullResponse.Contains("invalid")) return AuthStatus.InvalidLicense;
            if (httpStatus >= 500) return AuthStatus.Error;
            if (httpStatus >= 400) return AuthStatus.Failed;

            return AuthStatus.Unknown;
        }

        private string GetDefaultMessage(int httpStatus)
        {
            // ✅ C# 7.3 compatible - No switch expression
            if (httpStatus == 200) return "Success";
            if (httpStatus == 400) return "Bad request";
            if (httpStatus == 401) return "Unauthorized - Invalid credentials";
            if (httpStatus == 403) return "Forbidden - Access denied";
            if (httpStatus == 404) return "API endpoint not found";
            if (httpStatus == 429) return "Too many requests - Rate limited";
            if (httpStatus == 500) return "Internal server error";
            if (httpStatus == 502) return "Bad gateway";
            if (httpStatus == 503) return "Service unavailable - Maintenance";
            if (httpStatus == 504) return "Gateway timeout";
            return "HTTP " + httpStatus;
        }

        // ============================================
        // HELPERS
        // ============================================
        private Dictionary<string, object> CreateBasePayload(string type)
        {
            var payload = new Dictionary<string, object>();
            payload["type"] = type;
            payload["appname"] = _appName;
            payload["ownerid"] = _ownerIdOrAppKey;
            payload["secret"] = _secret;
            payload["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            return payload;
        }

        private void UpdateFromResult(AuthResult result)
        {
            IsSuccess = result.IsSuccess;
            Message = result.Message;
            User = result.User;
            Token = result.Token;
            LastStatus = result.Status;
        }

        private AuthResult RunSync(Func<Task<AuthResult>> asyncMethod)
        {
            try
            {
                var task = Task.Run(async () => await asyncMethod());
                if (task.Wait(TimeSpan.FromSeconds(_timeoutSeconds + 5)))
                {
                    return task.Result;
                }
                return CreateErrorResult("Operation timed out", AuthStatus.Timeout);
            }
            catch (AggregateException ae)
            {
                return CreateErrorResult(ae.InnerException?.Message ?? ae.Message);
            }
            catch (Exception ex)
            {
                return CreateErrorResult(ex.Message);
            }
        }

        private AuthResult CreateErrorResult(string message, AuthStatus status = AuthStatus.Error)
        {
            var result = new AuthResult();
            result.IsSuccess = false;
            result.Message = message;
            result.Status = status;
            result.HttpStatusCode = 0;
            return result;
        }

        private string MaskKey(string key)
        {
            if (string.IsNullOrEmpty(key) || key.Length < 8)
                return "***";
            return key.Substring(0, 4) + "****" + key.Substring(key.Length - 4);
        }

        private string GenerateUsernameFromKey(string key)
        {
            if (string.IsNullOrEmpty(key))
                return "user_" + Guid.NewGuid().ToString("N").Substring(0, 8);

            return "user_" + key.Replace("-", "").PadRight(8, '0').Substring(0, 8);
        }

        private string Truncate(string text, int maxLength)
        {
            if (string.IsNullOrEmpty(text)) return "";
            if (text.Length <= maxLength) return text;
            return text.Substring(0, maxLength) + "...";
        }

        // ============================================
        // HARDWARE ID
        // ============================================
        public static string GetHardwareId()
        {
            var hwidParts = new List<string>();

            try
            {
                using (var searcher = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string cpuId = obj["ProcessorId"]?.ToString();
                        if (!string.IsNullOrEmpty(cpuId) && cpuId != "0000000000000000")
                        {
                            hwidParts.Add(cpuId);
                            break;
                        }
                    }
                }

                using (var searcher = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_BaseBoard"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string mbSerial = obj["SerialNumber"]?.ToString();
                        if (!string.IsNullOrEmpty(mbSerial) && mbSerial != "To be filled by O.E.M.")
                        {
                            hwidParts.Add(mbSerial);
                            break;
                        }
                    }
                }
            }
            catch { }

            if (hwidParts.Count == 0)
            {
                try
                {
                    using (var searcher = new ManagementObjectSearcher("SELECT VolumeSerialNumber FROM Win32_LogicalDisk WHERE DeviceID='C:'"))
                    {
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            string volSerial = obj["VolumeSerialNumber"]?.ToString();
                            if (!string.IsNullOrEmpty(volSerial))
                            {
                                hwidParts.Add(volSerial);
                                break;
                            }
                        }
                    }
                }
                catch { }
            }

            if (hwidParts.Count == 0)
            {
                hwidParts.Add(Environment.MachineName + "_" + Environment.UserName);
            }

            string finalHwid = string.Join("-", hwidParts);

            if (finalHwid.Length > 64)
            {
                using (var sha256 = System.Security.Cryptography.SHA256.Create())
                {
                    var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(finalHwid));
                    finalHwid = BitConverter.ToString(hash).Replace("-", "").Substring(0, 64);
                }
            }

            return finalHwid;
        }

        public static string GetHwid()
        {
            return GetHardwareId();
        }

        // ============================================
        // INTERNAL CLASS
        // ============================================
        private class ApiResponseData
        {
            public bool Success { get; set; }
            public string Message { get; set; }
            public UserInfo User { get; set; }
            public string Token { get; set; }
        }
    }

    // ============================================
    // USER INFO CLASS
    // ============================================
    public class UserInfo
    {
        public string username { get; set; }
        public string email { get; set; }
        public string expiry { get; set; }
        public string hwid { get; set; }
        public string plan { get; set; }
        public string role { get; set; }
        public string subscription_type { get; set; }
        public string created_at { get; set; }
        public string last_login { get; set; }
        public bool is_banned { get; set; }
        public bool is_premium { get; set; }
        public int days_left { get; set; }
        public object extra_data { get; set; }

        public bool IsExpired()
        {
            if (string.IsNullOrEmpty(expiry))
                return days_left <= 0;

            if (expiry.ToLower() == "never" || expiry.ToLower() == "lifetime")
                return false;

            if (long.TryParse(expiry, out long unixTime))
                return DateTimeOffset.FromUnixTimeSeconds(unixTime) < DateTimeOffset.UtcNow;

            string[] formats = {
                "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy/MM/dd",
                "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-ddTHH:mm:ss",
                "yyyy-MM-ddTHH:mm:ssZ", "yyyy-MM-ddTHH:mm:ss.fffZ"
            };

            DateTime expiryDate;
            if (DateTime.TryParseExact(expiry, formats,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out expiryDate))
            {
                return expiryDate < DateTime.Now;
            }

            if (DateTime.TryParse(expiry, out expiryDate))
                return expiryDate < DateTime.Now;

            return false;
        }

        public int DaysRemaining()
        {
            if (IsExpired()) return 0;

            if (string.IsNullOrEmpty(expiry) || expiry.ToLower() == "never" || expiry.ToLower() == "lifetime")
                return 999;

            if (days_left > 0) return days_left;

            if (long.TryParse(expiry, out long unixTime))
                return (int)(DateTimeOffset.FromUnixTimeSeconds(unixTime) - DateTimeOffset.UtcNow).TotalDays;

            DateTime expiryDate;
            if (DateTime.TryParse(expiry, out expiryDate))
                return Math.Max(0, (expiryDate - DateTime.Now).Days);

            return 0;
        }

        public override string ToString()
        {
            return "User: " + username + ", Plan: " + (plan ?? "N/A") + 
                   ", Days Left: " + DaysRemaining() + ", Expired: " + IsExpired();
        }
    }
}