#A simple OTA test suite.
Upload jad and jar files from the pc browser(FF/chrome/safari/Opera "NO IE")
Download jad file from mobile browser. Test auto install the app described in the jad file.

##config:
    Default config in config.js
    port:8000

##depends:
node>=0.2.3
express v1.0.0rc4
formidable v0.9.9
nun v0.1.13

##url interface:
upload file: http://localhost:8000/
wap download: http://localhost:8000/wap
