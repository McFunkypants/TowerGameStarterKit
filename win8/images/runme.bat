@echo=off
cls
echo McFunkypants Win8 Image Batch Resizer
echo It needs:
echo big.png 270x270
echo wide.png 558x270
echo icon.png 90x90 
echo splash.png 1116x540
echo press any key to mass resize...
pause

echo ===================== images/logo.png 

resizeImage.exe 270x270 0 big.png 270x270.png
resizeImage.exe 210x210 0 big.png 210x210.png
resizeImage.exe 150x150 0 big.png 150x150.png
resizeImage.exe 120x120 0 big.png 120x120.png

echo ===================== images/wide-logo.png

resizeImage.exe 558x270 0 wide.png 558x270.png
resizeImage.exe 434x210 0 wide.png 434x210.png
resizeImage.exe 310x150 0 wide.png 310x150.png
resizeImage.exe 248x120 0 wide.png 248x120.png

echo ===================== images/small-logo.png

resizeImage.exe 256x256 0 big.png 256x256.png
resizeImage.exe 54x54 0 icon.png 54x54.png
resizeImage.exe 42x42 0 icon.png 42x42.png
resizeImage.exe 30x30 0 icon.png 30x30.png
resizeImage.exe 24x24 0 icon.png 24x24.png
resizeImage.exe 48x48 0 icon.png 48x48.png
resizeImage.exe 32x32 0 icon.png 32x32.png
resizeImage.exe 16x16 0 icon.png 16x16.png

echo ===================== images/store-logo.png

resizeImage.exe 90x90 0 icon.png 90x90.png
resizeImage.exe 70x70 0 icon.png 70x70.png
resizeImage.exe 50x50 0 icon.png 50x50.png

echo ===================== images/badge-logo.png

resizeImage.exe 43x43 0 icon.png 43x43.png
resizeImage.exe 34x34 0 icon.png 34x34.png
resizeImage.exe 24x24 0 icon.png 24x24.png

echo ===================== images/splash-screen.png

resizeImage.exe 1116x540 0 splash.png 1116x540.png
resizeImage.exe 868x420 0 splash.png 868x420.png
resizeImage.exe 620x300 0 splash.png 620x300.png

echo ===================== ALL DONE! WOOT!

pause