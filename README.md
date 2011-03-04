#A simple OTA test suite.
Upload jad and jar files from the pc browser(FF/chrome/safari/Opera "DO NOT USE IE")
Download jad file from mobile browser. Test auto install the app described in the jad file.

##depends:
  * node >= 0.4.0
  * express v2.0.0+
  * formidable v0.9.9
  * nun v0.1.13

##install
    install node        : http://nodejs.org/#build
    install npm         : curl http://npmjs.org/install.sh | sudo sh
    install express formidable nun    : npm install express formidable nun
 
##config:
    cat config.template.js > config.js
    vi config.js //Change listener ip and port

##start server
    cd your ota path
    ota_path/start.sh
    stop the server: ota_path/start.sh stop

##Access the app:
    pc upload file      : http://localhost:8000/
    mobile wap download : http://your-server-public-domain:8000/wap

