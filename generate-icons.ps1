$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public class OciIconGenerator {
    public static void GenerateIcon(int size, string outputPath) {
        using (Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;

            float scale = size / 200.0f;
            g.Clear(Color.Transparent);

            // 1. Outer White Circle with Blue Gradient Ring
            RectangleF ringRect = new RectangleF(8.0f * scale, 8.0f * scale, 184.0f * scale, 184.0f * scale);
            g.FillEllipse(Brushes.White, ringRect);

            using (LinearGradientBrush ringBrush = new LinearGradientBrush(
                ringRect,
                Color.FromArgb(255, 29, 78, 216),
                Color.FromArgb(255, 2, 132, 199),
                45.0f))
            using (Pen ringPen = new Pen(ringBrush, 10.0f * scale)) {
                g.DrawEllipse(ringPen, ringRect);
            }

            // Inner subtle blue ring
            RectangleF innerRect = new RectangleF(24.0f * scale, 24.0f * scale, 152.0f * scale, 152.0f * scale);
            using (Pen innerPen = new Pen(Color.FromArgb(100, 37, 99, 235), 2.5f * scale)) {
                g.DrawEllipse(innerPen, innerRect);
            }

            // 2. Open Book Pages
            // Red Left Outer Page
            using (GraphicsPath pathRed = new GraphicsPath()) {
                pathRed.AddBezier(
                    new PointF(58.0f * scale, 75.0f * scale),
                    new PointF(70.0f * scale, 62.0f * scale),
                    new PointF(85.0f * scale, 62.0f * scale),
                    new PointF(98.0f * scale, 75.0f * scale)
                );
                pathRed.AddLine(new PointF(98.0f * scale, 75.0f * scale), new PointF(98.0f * scale, 122.0f * scale));
                pathRed.AddBezier(
                    new PointF(98.0f * scale, 122.0f * scale),
                    new PointF(85.0f * scale, 110.0f * scale),
                    new PointF(70.0f * scale, 110.0f * scale),
                    new PointF(58.0f * scale, 122.0f * scale)
                );
                pathRed.CloseFigure();
                using (SolidBrush redBrush = new SolidBrush(Color.FromArgb(255, 239, 68, 68))) {
                    g.FillPath(redBrush, pathRed);
                }
            }

            // Gold Left Inner Page
            using (GraphicsPath pathGold = new GraphicsPath()) {
                pathGold.AddBezier(
                    new PointF(70.0f * scale, 73.0f * scale),
                    new PointF(80.0f * scale, 64.0f * scale),
                    new PointF(90.0f * scale, 66.0f * scale),
                    new PointF(98.0f * scale, 75.0f * scale)
                );
                pathGold.AddLine(new PointF(98.0f * scale, 75.0f * scale), new PointF(98.0f * scale, 122.0f * scale));
                pathGold.AddBezier(
                    new PointF(98.0f * scale, 122.0f * scale),
                    new PointF(90.0f * scale, 113.0f * scale),
                    new PointF(80.0f * scale, 112.0f * scale),
                    new PointF(70.0f * scale, 122.0f * scale)
                );
                pathGold.CloseFigure();
                using (SolidBrush goldBrush = new SolidBrush(Color.FromArgb(255, 245, 158, 11))) {
                    g.FillPath(goldBrush, pathGold);
                }
            }

            // Cyan Right Outer Page
            using (GraphicsPath pathCyan = new GraphicsPath()) {
                pathCyan.AddBezier(
                    new PointF(142.0f * scale, 75.0f * scale),
                    new PointF(130.0f * scale, 62.0f * scale),
                    new PointF(115.0f * scale, 62.0f * scale),
                    new PointF(102.0f * scale, 75.0f * scale)
                );
                pathCyan.AddLine(new PointF(102.0f * scale, 75.0f * scale), new PointF(102.0f * scale, 122.0f * scale));
                pathCyan.AddBezier(
                    new PointF(102.0f * scale, 122.0f * scale),
                    new PointF(115.0f * scale, 110.0f * scale),
                    new PointF(130.0f * scale, 110.0f * scale),
                    new PointF(142.0f * scale, 122.0f * scale)
                );
                pathCyan.CloseFigure();
                using (SolidBrush cyanBrush = new SolidBrush(Color.FromArgb(255, 6, 182, 212))) {
                    g.FillPath(cyanBrush, pathCyan);
                }
            }

            // Green Right Inner Page
            using (GraphicsPath pathGreen = new GraphicsPath()) {
                pathGreen.AddBezier(
                    new PointF(130.0f * scale, 73.0f * scale),
                    new PointF(120.0f * scale, 64.0f * scale),
                    new PointF(110.0f * scale, 66.0f * scale),
                    new PointF(102.0f * scale, 75.0f * scale)
                );
                pathGreen.AddLine(new PointF(102.0f * scale, 75.0f * scale), new PointF(102.0f * scale, 122.0f * scale));
                pathGreen.AddBezier(
                    new PointF(102.0f * scale, 122.0f * scale),
                    new PointF(110.0f * scale, 113.0f * scale),
                    new PointF(120.0f * scale, 112.0f * scale),
                    new PointF(130.0f * scale, 122.0f * scale)
                );
                pathGreen.CloseFigure();
                using (SolidBrush greenBrush = new SolidBrush(Color.FromArgb(255, 16, 185, 129))) {
                    g.FillPath(greenBrush, pathGreen);
                }
            }

            // 3. Central Rising Scholar Figure
            RectangleF headRect = new RectangleF(93.0f * scale, 51.0f * scale, 14.0f * scale, 14.0f * scale);
            using (SolidBrush blueHead = new SolidBrush(Color.FromArgb(255, 29, 78, 216))) {
                g.FillEllipse(blueHead, headRect);
            }

            using (GraphicsPath bodyPath = new GraphicsPath()) {
                bodyPath.AddBezier(
                    new PointF(100.0f * scale, 68.0f * scale),
                    new PointF(92.0f * scale, 82.0f * scale),
                    new PointF(82.0f * scale, 92.0f * scale),
                    new PointF(78.0f * scale, 112.0f * scale)
                );
                bodyPath.AddBezier(
                    new PointF(78.0f * scale, 112.0f * scale),
                    new PointF(92.0f * scale, 105.0f * scale),
                    new PointF(100.0f * scale, 88.0f * scale),
                    new PointF(100.0f * scale, 68.0f * scale)
                );
                bodyPath.CloseFigure();
                using (SolidBrush b1 = new SolidBrush(Color.FromArgb(255, 37, 99, 235))) {
                    g.FillPath(b1, bodyPath);
                }
            }

            using (GraphicsPath bodyPathR = new GraphicsPath()) {
                bodyPathR.AddBezier(
                    new PointF(100.0f * scale, 68.0f * scale),
                    new PointF(108.0f * scale, 82.0f * scale),
                    new PointF(118.0f * scale, 92.0f * scale),
                    new PointF(122.0f * scale, 112.0f * scale)
                );
                bodyPathR.AddBezier(
                    new PointF(122.0f * scale, 112.0f * scale),
                    new PointF(108.0f * scale, 105.0f * scale),
                    new PointF(100.0f * scale, 88.0f * scale),
                    new PointF(100.0f * scale, 68.0f * scale)
                );
                bodyPathR.CloseFigure();
                using (SolidBrush b2 = new SolidBrush(Color.FromArgb(255, 2, 132, 199))) {
                    g.FillPath(b2, bodyPathR);
                }
            }

            // 4. Supporting Base Hand
            using (GraphicsPath handPath = new GraphicsPath()) {
                handPath.AddBezier(
                    new PointF(52.0f * scale, 132.0f * scale),
                    new PointF(70.0f * scale, 126.0f * scale),
                    new PointF(90.0f * scale, 134.0f * scale),
                    new PointF(110.0f * scale, 138.0f * scale)
                );
                handPath.AddBezier(
                    new PointF(110.0f * scale, 138.0f * scale),
                    new PointF(130.0f * scale, 142.0f * scale),
                    new PointF(148.0f * scale, 132.0f * scale),
                    new PointF(152.0f * scale, 128.0f * scale)
                );
                handPath.AddBezier(
                    new PointF(152.0f * scale, 128.0f * scale),
                    new PointF(145.0f * scale, 142.0f * scale),
                    new PointF(125.0f * scale, 152.0f * scale),
                    new PointF(98.0f * scale, 152.0f * scale)
                );
                handPath.AddBezier(
                    new PointF(98.0f * scale, 152.0f * scale),
                    new PointF(75.0f * scale, 152.0f * scale),
                    new PointF(58.0f * scale, 142.0f * scale),
                    new PointF(52.0f * scale, 132.0f * scale)
                );
                handPath.CloseFigure();

                RectangleF handRect = new RectangleF(50.0f * scale, 120.0f * scale, 105.0f * scale, 35.0f * scale);
                using (LinearGradientBrush handBrush = new LinearGradientBrush(
                    handRect,
                    Color.FromArgb(255, 30, 58, 138),
                    Color.FromArgb(255, 59, 130, 246),
                    0.0f)) {
                    g.FillPath(handBrush, handPath);
                }
            }

            // 5. Text
            if (size >= 96) {
                using (Font font = new Font("Arial", Math.Max(7.0f, 7.8f * scale), FontStyle.Bold))
                using (StringFormat sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
                using (SolidBrush tb = new SolidBrush(Color.FromArgb(255, 15, 23, 42)))
                using (SolidBrush ob = new SolidBrush(Color.FromArgb(255, 2, 132, 199))) {
                    g.DrawString("ODISHA COMPETITIVE INSTITUTE", font, tb, new PointF(100.0f * scale, 33.0f * scale), sf);
                    g.DrawString("BHADRAK", font, ob, new PointF(100.0f * scale, 168.0f * scale), sf);
                }
            }

            string dir = Path.GetDirectoryName(outputPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) {
                Directory.CreateDirectory(dir);
            }

            bmp.Save(outputPath, ImageFormat.Png);
            Console.WriteLine("Successfully created: " + outputPath + " (" + size + "x" + size + ")");
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

[OciIconGenerator]::GenerateIcon(48,  "d:\oci-platform\app\android\app\src\main\res\mipmap-mdpi\ic_launcher.png")
[OciIconGenerator]::GenerateIcon(72,  "d:\oci-platform\app\android\app\src\main\res\mipmap-hdpi\ic_launcher.png")
[OciIconGenerator]::GenerateIcon(96,  "d:\oci-platform\app\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png")
[OciIconGenerator]::GenerateIcon(144, "d:\oci-platform\app\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png")
[OciIconGenerator]::GenerateIcon(192, "d:\oci-platform\app\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png")

[OciIconGenerator]::GenerateIcon(32,  "d:\oci-platform\app\web\favicon.png")
[OciIconGenerator]::GenerateIcon(192, "d:\oci-platform\app\web\icons\Icon-192.png")
[OciIconGenerator]::GenerateIcon(512, "d:\oci-platform\app\web\icons\Icon-512.png")
[OciIconGenerator]::GenerateIcon(192, "d:\oci-platform\app\web\icons\Icon-maskable-192.png")
[OciIconGenerator]::GenerateIcon(512, "d:\oci-platform\app\web\icons\Icon-maskable-512.png")
[OciIconGenerator]::GenerateIcon(512, "d:\oci-platform\app\assets\logo.png")

[OciIconGenerator]::GenerateIcon(512, "d:\oci-platform\public-website\public\oci-logo.png")
[OciIconGenerator]::GenerateIcon(192, "d:\oci-platform\public-website\public\icon.png")
[OciIconGenerator]::GenerateIcon(180, "d:\oci-platform\public-website\public\apple-icon.png")
[OciIconGenerator]::GenerateIcon(32,  "d:\oci-platform\public-website\public\favicon.ico")

[OciIconGenerator]::GenerateIcon(512, "d:\oci-platform\admin\public\oci-logo.png")
[OciIconGenerator]::GenerateIcon(192, "d:\oci-platform\admin\public\icon.png")
[OciIconGenerator]::GenerateIcon(32,  "d:\oci-platform\admin\public\favicon.ico")

Write-Output "ALL OCI APP ICONS & FAVICONS GENERATED SUCCESSFULLY!"
