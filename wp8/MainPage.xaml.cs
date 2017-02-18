using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using System.Diagnostics;

// used to track down RAM usage
using Microsoft.Phone.Info;//.DeviceStatus;

// High performance C++ sound engine to work around broken HTML5 audio on wp8
using XAudioPlayer;

namespace TowerGameStarterKit
{
    public partial class MainPage : PhoneApplicationPage
    {

        // SFX
        public XAudio2SoundPlayer audioPlayer;
        uint soundCount;

        // game state: used when handling the BACK BUTTON
        public bool gameAtMainMenu = false;

        // Url of Home page
        private string MainUri = "/Html/index.html";

        // Constructor
        public MainPage()
        {
            InitializeComponent();
            
            // SFX
            audioPlayer = new XAudio2SoundPlayer(); 
            soundCount = audioPlayer.LoadSounds(); // all of em!
            audioPlayer.SoundEnded += audioPlayer_SoundEnded;

        }

        public void audioPlayer_Suspend()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("audioPlayer_Suspend");
                if (audioPlayer != null)
                    audioPlayer.Suspend();
            }
            catch
            {
                // completely ignore
            }
        }

        public void audioPlayer_Resume()
        {
            try
            {
                System.Diagnostics.Debug.WriteLine("audioPlayer_Resume");
                if (audioPlayer != null)
                    audioPlayer.Resume();
            }
            catch
            {
                // completely ignore
            }
        }

        void audioPlayer_SoundEnded(int index)
        {
            System.Diagnostics.Debug.WriteLine("audioPlayer_SoundEnded");
            /*
            this.Dispatcher.BeginInvoke(delegate
            {
                switch (index)
                {
                    case 0:
                        s1.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                    case 1:
                        s2.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                    case 2:
                        s3.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                    case 3:
                        s4.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                    case 4:
                        s5.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                    case 5:
                        s6.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                    case 6:
                        s7.Fill = new SolidColorBrush(Colors.Blue);
                        break;
                }
            });
            */
        }


        private void playSound(uint index)
        {
            System.Diagnostics.Debug.WriteLine("playSound " + Convert.ToString(index));
            // FIXME: multiple channels for overlapping identical sounds
            //if (audioPlayer.IsSoundPlaying(index))
            //{
            //    audioPlayer.StopSound(index);
            //}
            if ((index >= 0) & (index < soundCount))
            {
                audioPlayer.PlaySound(index);
            }
            else
            {
                // in an error, play something anyways - default to the LAST SOUND LOADED?
                // no - play nothing and just be quiet
                // audioPlayer.PlaySound(soundCount-1); 
                System.Diagnostics.Debug.WriteLine("playSound ignoring an invalid sound number");
            }
        }

        private void Browser_Loaded(object sender, RoutedEventArgs e)
        {
            Browser.IsScriptEnabled = true;

            // Add your URL here
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));

            // $CTK this lets javascript talk to c#
            // see http://stackoverflow.com/questions/14567491/windows-8-phone-ie10-javascript-debugging
            Browser.ScriptNotify += (s, arg) =>
            {
                try
                {
                    GC.Collect(); // force more garbage collection during the run - this only affects C# not Javascript GC
                    System.Diagnostics.Debug.WriteLine(arg.Value +
                        " - RAM:"+ Convert.ToString(Microsoft.Phone.Info.DeviceStatus.DeviceTotalMemory / 1048576) + "MB"
                        + " USE:" + Convert.ToString(Microsoft.Phone.Info.DeviceStatus.ApplicationCurrentMemoryUsage / 1048576) + "MB"
                        + " MAX:" + Convert.ToString(Microsoft.Phone.Info.DeviceStatus.ApplicationPeakMemoryUsage / 1048576) + "MB"
                        );
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error writing to debug console:" + ex.Message);
                }

                if (arg.Value.StartsWith("SFX:"))
                {
                    // turn anything after the "SFX:" into a number and play that sound
                    uint soundNumber = 0;
                    uint.TryParse(arg.Value.Remove(0, 4), out soundNumber);
                    playSound(soundNumber);
                }

                if (arg.Value.StartsWith("[SEND-BACK-BUTTON-EVENTS-PLEASE]"))
                {
                    gameAtMainMenu = false;
                }

                if (arg.Value.StartsWith("[STOP-SENDING-BACK-BUTTON-EVENTS]"))
                {
                    gameAtMainMenu = true;
                }

            };     
        }

        // TODO FIXME: 
        // see http://stackoverflow.com/questions/18479578/how-to-override-windows-back-button-in-windows-phone-8?rq=1
        private void PhoneApplicationPage_BackKeyPress(object sender, System.ComponentModel.CancelEventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("PhoneApplicationPage_BackKeyPress");

            if (!gameAtMainMenu)
            {
                e.Cancel = true; // override default behavior and let javascript deal with state changes or app exit
                Browser.InvokeScript("onWP8BackButton", "");
            }
            // else, just quit the app the normal way
            
            //MessageBoxResult mRes = MessageBox.Show("Would you like to exit?", "Exit", MessageBoxButton.OKCancel);
            //if (mRes == MessageBoxResult.OK)
            //{
            //    NavigationService.GoBack();
            //}
            //if (mRes == MessageBoxResult.Cancel)
            //{
            //    e.Cancel = true;
            //}
        }
        
        // Navigates back in the web browser's navigation stack, not the applications.
        private void BackApplicationBar_Click(object sender, EventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("BackApplicationBar_Click");
            Browser.GoBack();
        }

        // Navigates forward in the web browser's navigation stack, not the applications.
        private void ForwardApplicationBar_Click(object sender, EventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("ForwardApplicationBar_Click");
            Browser.GoForward();
        }

        // Navigates to the initial "home" page.
        private void HomeMenuItem_Click(object sender, EventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("HomeMenuItem_Click");
            Browser.Navigate(new Uri(MainUri, UriKind.Relative));
        }

        // Handle navigation failures.
        private void Browser_NavigationFailed(object sender, System.Windows.Navigation.NavigationFailedEventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("");
            //MessageBox.Show("Navigation to this page failed, check your internet connection");
        }
    }
}
