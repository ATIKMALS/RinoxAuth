using Guna.UI2.WinForms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using RinoxAuth; // ✅ Changed from YourAuth

namespace Fluxo_Prime_SRC___Fxbrii
{
    public partial class Form2 : Form
    {
        private AuthClient client;

        public Form2()
        {
            InitializeComponent();

            // Initialize auth client
            client = new AuthClient(
                appName: "BASIC PANEL",
                ownerIdOrAppKey: "e1df0d16",
                secret: "7d08a08fe6e9ec8c4e2c4f7101aacd845d9d8dc90121c8da567b1e939832c42c",
                version: "1.0.0",
                apiBaseUrl: "https://rinoxauth-vlvr.onrender.com"
            );

            // Optional: Subscribe to events
            client.OnLog += (msg) => System.Diagnostics.Debug.WriteLine($"[Auth] {msg}");
            client.OnError += (msg) => System.Diagnostics.Debug.WriteLine($"[Auth Error] {msg}");
        }

        // ============================================
        // LOGIN BUTTON - Using async/await properly
        // ============================================
        private async void btnLogin_Click(object sender, EventArgs e)
        {
            // Disable button to prevent double click
            btnLogin.Enabled = false;
            btnLogin.Text = "Connecting...";

            try
            {
                // Step 1: Init connection
                var initResult = await client.InitAsync();
                
                if (!initResult.IsSuccess)
                {
                    Sohan.NotificationForm.ShowNotification(
                        "Connection Error", 
                        initResult.Message, 
                        Sohan.NotificationType.Error
                    );
                    return;
                }

                btnLogin.Text = "Logging in...";

                // Step 2: Login
                var loginResult = await client.LoginAsync(
                    txtUsername.Text.Trim(), 
                    txtPassword.Text.Trim()
                );

                if (loginResult.IsSuccess)
                {
                    // Save user info if needed
                    string username = loginResult.User?.username ?? "User";
                    string plan = loginResult.User?.plan ?? "Basic";
                    int daysLeft = loginResult.User?.DaysRemaining() ?? 0;

                    Sohan.NotificationForm.ShowNotification(
                        "Welcome!", 
                        $"Logged in as {username}\nPlan: {plan}\nDays Left: {daysLeft}", 
                        Sohan.NotificationType.Success
                    );

                    // Open next form
                    Form3 nextForm = new Form3();
                    nextForm.Show();
                    this.Hide();
                }
                else
                {
                    // Handle different error types
                    string errorMessage = loginResult.Message;
                    
                    switch (loginResult.Status)
                    {
                        case AuthStatus.InvalidLicense:
                            errorMessage = "Invalid username or password";
                            break;
                        case AuthStatus.Banned:
                            errorMessage = "Your account has been banned";
                            break;
                        case AuthStatus.Expired:
                            errorMessage = "Your subscription has expired";
                            break;
                        case AuthStatus.HwidMismatch:
                            errorMessage = "This account is locked to another PC";
                            break;
                    }

                    Sohan.NotificationForm.ShowNotification(
                        "Login Failed", 
                        errorMessage, 
                        Sohan.NotificationType.Error
                    );
                }
            }
            catch (Exception ex)
            {
                Sohan.NotificationForm.ShowNotification(
                    "Error", 
                    $"An error occurred: {ex.Message}", 
                    Sohan.NotificationType.Error
                );
            }
            finally
            {
                // Re-enable button
                btnLogin.Enabled = true;
                btnLogin.Text = "Login";
            }
        }

        // ============================================
        // LICENSE LOGIN - If using license keys
        // ============================================
        private async void btnLicenseLogin_Click(object sender, EventArgs e)
        {
            btnLicenseLogin.Enabled = false;
            btnLicenseLogin.Text = "Validating...";

            try
            {
                // Quick license login
                var result = await client.QuickLicenseLoginAsync(txtLicenseKey.Text.Trim());

                if (result.IsSuccess)
                {
                    Sohan.NotificationForm.ShowNotification(
                        "Success!", 
                        $"Welcome! Days left: {result.User?.DaysRemaining()}", 
                        Sohan.NotificationType.Success
                    );

                    Form3 nextForm = new Form3();
                    nextForm.Show();
                    this.Hide();
                }
                else
                {
                    Sohan.NotificationForm.ShowNotification(
                        "License Error", 
                        result.Message, 
                        Sohan.NotificationType.Error
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                btnLicenseLogin.Enabled = true;
                btnLicenseLogin.Text = "Activate License";
            }
        }

        // ============================================
        // REGISTER BUTTON
        // ============================================
        private async void btnRegister_Click(object sender, EventArgs e)
        {
            btnRegister.Enabled = false;
            btnRegister.Text = "Registering...";

            try
            {
                var result = await client.RegisterAsync(
                    username: txtRegUsername.Text.Trim(),
                    password: txtRegPassword.Text.Trim(),
                    licenseKey: txtRegLicenseKey?.Text.Trim(), // Optional
                    email: txtRegEmail?.Text.Trim()             // Optional
                );

                if (result.IsSuccess)
                {
                    Sohan.NotificationForm.ShowNotification(
                        "Registered!", 
                        "Account created successfully! You can now login.", 
                        Sohan.NotificationType.Success
                    );

                    // Switch to login tab
                    tabControl.SelectedIndex = 0;
                }
                else
                {
                    Sohan.NotificationForm.ShowNotification(
                        "Registration Failed", 
                        result.Message, 
                        Sohan.NotificationType.Error
                    );
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error");
            }
            finally
            {
                btnRegister.Enabled = true;
                btnRegister.Text = "Register";
            }
        }

        // ============================================
        // SIMPLE SYNC USAGE (Not recommended for UI)
        // ============================================
        private void Login_Click(object sender, EventArgs e)
        {
            // ✅ Synchronous version - blocks UI
            var result = client.LoginSync(txtUsername.Text, txtPassword.Text);
            
            if (result.IsSuccess)
            {
                Form3 ABCS = new Form3();
                ABCS.Show();
                this.Hide();
            }
            else
            {
                Sohan.NotificationForm.ShowNotification(
                    "Login Failed", 
                    result.Message, 
                    Sohan.NotificationType.Error
                );
            }
        }

        // ============================================
        // FORM CLOSING - Cleanup
        // ============================================
        private void Form2_FormClosing(object sender, FormClosingEventArgs e)
        {
            // Cleanup if needed
            client = null;
        }
    }
}