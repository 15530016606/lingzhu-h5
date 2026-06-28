import http.server, socketserver, urllib.request, os

API_TARGET = 'http://localhost:3000'

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            url = API_TARGET + self.path
            try:
                req = urllib.request.Request(url)
                resp = urllib.request.urlopen(req)
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    if k.lower() not in ('transfer-encoding', 'content-encoding', 'connection'):
                        self.send_header(k, v)
                self.end_headers()
                self.wfile.write(resp.read())
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(e.read())
            return
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', 5000), ProxyHandler) as httpd:
    print(f'Frontend: http://localhost:5000  (API proxied to {API_TARGET})')
    httpd.serve_forever()
