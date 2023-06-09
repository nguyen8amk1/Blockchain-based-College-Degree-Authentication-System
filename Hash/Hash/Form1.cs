using System;
using System.IO;
using System.Security.Cryptography;
using System.Windows.Forms;

namespace Hash
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            string filePath = textBox1.Text;
            if (File.Exists(filePath))
            {
                using (var sha256 = SHA256.Create())
                {
                    using (var stream = File.OpenRead(filePath))
                    {
                        byte[] hash = sha256.ComputeHash(stream);
                        textBox2.Text = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
                    }
                }
            }
            else
            {
                MessageBox.Show("File not found.");
            }
        }
    }
}
