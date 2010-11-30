#A simple OTA test suite.
Upload jad and jar files from the pc browser(FF/chrome/safari/Opera "NO IE")
Download jad file from mobile browser. Test auto install the app described in the jad file.

##depends:
  * node >= 0.2.3
  * express v1.0.0
  * formidable v0.9.9
  * nun v0.1.13

##install
    install node        : http://nodejs.org/#build
    install npm         : curl http://npmjs.org/install.sh | sudo sh
    install express     : npm install express
    install formidable  : npm install express
    install nun         : npm install nun

##config:
    cat config.template.js > config.js
    vi config.js

##start server
    cd your ota path
    node index.js | tee -a ota.log &

##Access the app:
    pc upload file      : http://localhost:8000/
    mobile wap download : http://your-server-public-domain:8000/wap

