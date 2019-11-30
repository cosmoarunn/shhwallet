import sys
import ssl
import psutil
import OpenSSL.crypto
import urllib.parse
import urllib.request
import requests


server_url = 'https://yoursite.com:3030/auth'
certfile = '/home/yoursite/ssl.cert'
keyfile = '/home/yoursite/sslß.key'

serverOn = False;


from subprocess import Popen

for process in psutil.process_iter():
    if process.cmdline() == ['node', 'scripts/main.js']:
        serverOn = True;
        """ s = requests.Session()
        s.verify = certfile
        """

        '''sys.exit('SHH Server already running: exiting..')
'''
    else:
        print('SHH main server not found: starting it..')
        Popen(['node', 'scripts/main.js'])

requestServer()

def requestServer():
    if serverOn:


        response = requests.get(url, cert=(certfile, keyfile))
        print("Request with certificate and key file")
        print(response)
