/*
 * @App: Remote library
 * @Author: SVSys s.r.o.
 * @Build: Thu, 18 Mar 2021 10:53:03 GMT
 */
var _CONFRemoteService = {
  APIHost: 'https://rcct.ceskatelevize.cz',
  APIPath: '/remoteapi/v0/io',
  createUniquePairedDeviceName: !0,
  version: '0.2',
  description: 'WEB Remote API service'
}
function Remote(e, t) {
  var n = this
  ;(this.enable = e && 'undefined' != typeof io && !!_CONFRemoteService),
    (this.createUniquePairedDeviceName =
      !_CONFRemoteService || _CONFRemoteService.createUniquePairedDeviceName),
    (this.inRemoveDevices = !1),
    (this.isInit = !1),
    (this.socket = null),
    (this.onConnected = null),
    (this.onConnectError = null),
    (this.onError = null),
    (this.onDisconnected = null),
    (this.onCommand = null),
    (this.onGetNewPairingId = null),
    (this.onPairDeviceResult = null),
    (this.onUpdatePairedDeviceStatus = null),
    (this.deviceTypeName = t),
    this.restoreAllValuesFromCookies(),
    '' != this.getDeviceID() && this.saveAllValuesToCookies(),
    _CONFRemoteService
      ? ((this.socketioHost = _CONFRemoteService.APIHost),
        (this.socketioPath = _CONFRemoteService.APIPath),
        (this.socketTransports = _CONFRemoteService.APITransports))
      : ((this.socketioHost = ''),
        (this.socketioPath = ''),
        (this.socketTransports = !1)),
    (this.connected = !1)
  t = this.getPairCodeFromUrlParams()
  t ? this.pairDevice(t) : this.connect(),
    (document.onunload = function () {
      n.disconnect()
    })
}
;(Remote.prototype._debugLogTransport = function () {
  'undefined' != typeof _debug &&
    _debug.logTime('Transport method: ' + this.socket.io.engine.transport.name)
}),
  (Remote.prototype.getPairCodeFromUrlParams = function () {
    var o = {}
    window.location.search.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function (e, t, n) {
        o[t] = n
      }
    )
    try {
      if (o.paircode) return o.paircode
    } catch (e) {}
    return !1
  }),
  (Remote.prototype.getKeyValueFromCookies = function (e) {
    e += '='
    for (var t = document.cookie.split(';'), n = 0; n < t.length; n++) {
      for (var o = t[n]; ' ' == o.charAt(0); ) o = o.substring(1, o.length)
      if (0 == o.indexOf(e)) return unescape(o.substring(e.length, o.length))
    }
    return null
  }),
  (Remote.prototype.setKeyValueToCookies = function (e, t) {
    var n = new Date()
    n.setTime(n.getTime() + 15552e6)
    n = n.toGMTString()
    ;(t = escape(t)),
      (document.cookie = e + '=' + t + ';expires=' + n + '; path=/')
  }),
  (Remote.prototype.getKeyValueFromCookies = function (e) {
    ;(e += '='), (cookies = document.cookie.split(';'))
    for (var t = 0; t < cookies.length; t++) {
      for (var n = cookies[t]; ' ' == n.charAt(0); )
        n = n.substring(1, n.length)
      if (0 == n.indexOf(e)) return unescape(n.substring(e.length, n.length))
    }
    return null
  }),
  (Remote.prototype.getDeviceName = function () {
    return this.deviceName
  }),
  (Remote.prototype.setDeviceName = function (e) {
    '' == e && (e = this.deviceTypeName),
      (this.deviceName = e),
      this.setKeyValueToCookies('devicename', e)
  }),
  (Remote.prototype.getDeviceID = function () {
    return null != this.id ? this.id : ''
  }),
  (Remote.prototype.setDeviceID = function (e, t) {
    return (
      '' != e &&
      null == this.id &&
      ((this.id = e), 1 == t && this.setKeyValueToCookies('deviceid', e), !0)
    )
  }),
  (Remote.prototype.restoreAllValuesFromCookies = function () {
    var e = this.getKeyValueFromCookies('devicename')
    ;(this.deviceName = null == e ? this.deviceTypeName : e),
      (this.id = this.getKeyValueFromCookies('deviceid')),
      '' == this.id && (this.id = null)
    e = this.getKeyValueFromCookies('devicepaired')
    ;(this.paired = null == e || '' == e ? {} : JSON.parse(e)),
      (this.pairedOnline = {}),
      (this.NoOfPairedOnline = 0)
  }),
  (Remote.prototype.saveAllValuesToCookies = function () {
    return (
      null != this.id &&
      (this.setKeyValueToCookies('devicename', this.deviceName),
      this.setKeyValueToCookies('deviceid', this.id),
      this.setKeyValueToCookies('devicepaired', JSON.stringify(this.paired)),
      !0)
    )
  }),
  (Remote.prototype.updatePairedDevice = function (e, t, n) {
    if ('online' == n) {
      if (void 0 === this.paired[e]) {
        var o = 0
        if (this.createUniquePairedDeviceName)
          for (var r = 0; r < 1e3; r++) {
            var i,
              s = !0
            for (i in this.paired)
              if (this.paired.hasOwnProperty(i))
                if (this.paired[i] == t + (r ? '' + r : '')) {
                  s = !1
                  break
                }
            if (s) {
              o = r
              break
            }
          }
        this.paired[e] = t + (o ? '' + o : '')
      }
      this.saveAllValuesToCookies(), (this.pairedOnline[e] = this.paired[e])
    } else
      void 0 !== this.pairedOnline[e] && delete this.pairedOnline[e],
        'removed' == n &&
          void 0 !== this.paired[e] &&
          (delete this.paired[e], this.saveAllValuesToCookies())
    var a = 0
    for (r in this.pairedOnline) this.pairedOnline.hasOwnProperty(r) && a++
    this.NoOfPairedOnline = a
  }),
  (Remote.prototype.hasPairedOnline = function () {
    return 0 < this.NoOfPairedOnline
  }),
  (Remote.prototype.getPairedOnline = function () {
    return this.pairedOnline
  }),
  (Remote.prototype.getAllPaired = function () {
    var e,
      t = {}
    for (e in this.paired)
      t[e] = {
        name: this.paired[e],
        state: this.pairedOnline[e] ? 'online' : 'offline'
      }
    return t
  }),
  (Remote.prototype.setPairedDeviceName = function (e, t) {
    void 0 !== this.paired[e] &&
      ((this.paired[e] = t), this.saveAllValuesToCookies())
  }),
  (Remote.prototype.init = function () {
    var n
    this.enable &&
      !this.isInit &&
      ((n = this).socket.on('connect', function () {
        ;(n.connected = !0),
          'undefined' != typeof _debug && _debug.logTime('Connected'),
          null != n.onConnected && n.onConnected(),
          n.sendPairedDevices()
      }),
      this.socket.on('connect_error', function (e) {
        null != n.onConnectError && n.onConnectError(e)
      }),
      this.socket.on('error', function (e) {
        null != n.onError && n.onError(e)
      }),
      this.socket.on('newid', function (e) {
        ;(n.id = e),
          'undefined' != typeof _debug && _debug.logTime('Get new ID: ' + e)
      }),
      this.socket.on('pairdeviceresult', function (e) {
        'undefined' != typeof _debug &&
          _debug.logTime('Pair device result: ' + JSON.stringify(e)),
          'ok' == e.result &&
            n.updatePairedDevice(
              e.paireddevice.id,
              e.paireddevice.type,
              e.paireddevice.state
            ),
          null != n.onPairDeviceResult && n.onPairDeviceResult(e)
      }),
      this.socket.on('newpairingid', function (e) {
        'undefined' != typeof _debug && _debug.logTime('New pairing ID: ' + e),
          null != n.onGetNewPairingId && n.onGetNewPairingId(e)
      }),
      this.socket.on('updatepaireddevicestatus', function (e) {
        'undefined' != typeof _debug &&
          _debug.logTime(
            'Update paired device state ID: ' +
              e.paireddevice.id +
              ' state: ' +
              e.paireddevice.state
          ),
          n.updatePairedDevice(
            e.paireddevice.id,
            e.paireddevice.type,
            e.paireddevice.state
          ),
          null != n.onUpdatePairedDeviceStatus &&
            n.onUpdatePairedDeviceStatus(e)
      }),
      this.socket.on('command', function (e, t) {
        'undefined' != typeof _debug &&
          _debug.logTime('Command from: ' + e + ', data: ' + JSON.stringify(t)),
          null != n.onCommand && n.onCommand(e, t)
      }),
      this.socket.on('syscommand', function (e, t) {
        'undefined' != typeof _debug &&
          _debug.logTime(
            'SysCommand from: ' + e + ', data: ' + JSON.stringify(t)
          ),
          n.doSystemCommandProcessing(e, t)
      }),
      this.socket.on('removeallpairedresult', function (e, t) {
        'undefined' != typeof _debug &&
          _debug.logTime('Remove all paired result: ' + t),
          n.setKeyValueToCookies('deviceid', ''),
          (n.id = null),
          n.setKeyValueToCookies('devicepaired', ''),
          delete n.paired,
          (n.paired = {}),
          n.disconnect()
      }),
      this.socket.on('disconnect', function () {
        ;(n.connected = !1),
          delete n.pairedOnline,
          (n.pairedOnline = {}),
          (n.NoOfPairedOnline = 0),
          'undefined' != typeof _debug && _debug.logTime('Disconnected'),
          n.inRemoveDevices || null == n.onDisconnected || n.onDisconnected(),
          n.inRemoveDevices &&
            ((n.inRemoveDevices = !1),
            setTimeout(function () {
              n.createPairingID()
            }, 500))
      }),
      (this.isInit = !0))
  }),
  (Remote.prototype.connect = function () {
    null != this.id && this._connect()
  }),
  (Remote.prototype._connect = function () {
    var e
    !this.connected &&
      this.enable &&
      (null == this.socket
        ? ((e = {
            path: this.socketioPath,
            query:
              'devicetype=' +
              this.deviceTypeName +
              (null != this.id
                ? '&deviceid=' + this.id + '&devicename=' + this.deviceName
                : '')
          }),
          this.socketTransports && (e.transports = this.socketTransports),
          (this.socket = io(this.socketioHost, e)),
          this.init())
        : this.socket.connect(),
      'undefined' != typeof _debug && _debug.logTime('Connecting...'))
  }),
  (Remote.prototype.disconnect = function () {
    this.connected &&
      ('undefined' != typeof _debug && _debug.logTime('Disconnecting...'),
      this.socket.disconnect())
  }),
  (Remote.prototype.pairDevice = function (e) {
    this._connect(),
      this.enable &&
        ((e = e.replace(/\s+/g, '')),
        this.socket.emit('pairdevice', e),
        'undefined' != typeof _debug &&
          _debug.logTime('Pair device - pairing ID: ' + e))
  }),
  (Remote.prototype.createPairingID = function () {
    this._connect(),
      this.enable &&
        (this.socket.emit('createpairingid'),
        'undefined' != typeof _debug && _debug.logTime('Create pairing ID'))
  }),
  (Remote.prototype.sendPairedDevices = function () {
    this._connect(),
      this.enable &&
        (this.socket.emit('paireddevices', this.paired),
        'undefined' != typeof _debug &&
          _debug.logTime('Sending paired devices to server'))
  }),
  (Remote.prototype.removeAllPaired = function () {
    this._connect(),
      this.enable &&
        ((this.inRemoveDevices = !0),
        this.socket.emit('removeallpaired'),
        'undefined' != typeof _debug &&
          _debug.logTime('Remove all paired devices'))
  }),
  (Remote.prototype.removePairedDevice = function (e) {
    this._connect(),
      this.enable &&
        void 0 !== this.pairedOnline[e] &&
        (this.socket.emit('sendsyscommand', e, {
          command: 'removepaireddevice',
          type: 'request',
          deviceid: e
        }),
        'undefined' != typeof _debug &&
          _debug.logTime('Remove paired device - device ID: ' + e))
  }),
  (Remote.prototype.sendCommand = function (e, t) {
    this.connected &&
      this.hasPairedOnline() &&
      (this.socket.emit('sendcommand', e, t),
      'undefined' != typeof _debug &&
        _debug.logTime(
          'Sending command: "' + e + '", data: "' + JSON.stringify(t)
        ))
  }),
  (Remote.prototype.doSystemCommandProcessing = function (e, t) {
    if (t.command && 'removepaireddevice' === t.command)
      if (t.type)
        switch (t.type) {
          case 'request':
            ;(t.type = 'response'),
              (t.status = 'ok'),
              this.updatePairedDevice(e, !1, 'removed'),
              this.socket.emit('sendsyscommand', e, t),
              null != this.onUpdatePairedDeviceStatus &&
                this.onUpdatePairedDeviceStatus({})
            break
          case 'response':
            'ok' == t.status &&
              (this.updatePairedDevice(t.deviceid, !1, 'removed'),
              this.sendPairedDevices(),
              null != this.onUpdatePairedDeviceStatus &&
                this.onUpdatePairedDeviceStatus({}))
        }
  }),
  (function (e, t) {
    'object' == typeof exports && 'object' == typeof module
      ? (module.exports = t())
      : 'function' == typeof define && define.amd
      ? define([], t)
      : 'object' == typeof exports
      ? (exports.io = t())
      : (e.io = t())
  })(this, function () {
    return (
      (r = {}),
      (n.m = o =
        [
          function (e, t, n) {
            function o(e, t) {
              'object' == typeof e && ((t = e), (e = void 0)), (t = t || {})
              var n = i(e),
                o = n.source,
                r = n.id,
                e = n.path,
                e = c[r] && e in c[r].nsps,
                r =
                  t.forceNew ||
                  t['force new connection'] ||
                  !1 === t.multiplex ||
                  e
                    ? (a('ignoring socket cache for %s', o), s(o, t))
                    : (c[r] ||
                        (a('new io instance for %s', o), (c[r] = s(o, t))),
                      c[r])
              return (
                n.query && !t.query && (t.query = n.query), r.socket(n.path, t)
              )
            }
            var i = n(1),
              r = n(7),
              s = n(12),
              a = n(3)('socket.io-client')
            e.exports = t = o
            var c = (t.managers = {})
            ;(t.protocol = r.protocol),
              (t.connect = o),
              (t.Manager = n(12)),
              (t.Socket = n(37))
          },
          function (e, t, n) {
            var o = n(2),
              r = n(3)('socket.io-client:url')
            e.exports = function (e, t) {
              var n = e
              return (
                (t = t || ('undefined' != typeof location && location)),
                'string' ==
                  typeof (e = null == e ? t.protocol + '//' + t.host : e) &&
                  ('/' === e.charAt(0) &&
                    (e = '/' === e.charAt(1) ? t.protocol + e : t.host + e),
                  /^(https?|wss?):\/\//.test(e) ||
                    (r('protocol-less url %s', e),
                    (e =
                      void 0 !== t ? t.protocol + '//' + e : 'https://' + e)),
                  r('parse %s', e),
                  (n = o(e))),
                n.port ||
                  (/^(http|ws)$/.test(n.protocol)
                    ? (n.port = '80')
                    : /^(http|ws)s$/.test(n.protocol) && (n.port = '443')),
                (n.path = n.path || '/'),
                (e = -1 !== n.host.indexOf(':') ? '[' + n.host + ']' : n.host),
                (n.id = n.protocol + '://' + e + ':' + n.port),
                (n.href =
                  n.protocol +
                  '://' +
                  e +
                  (t && t.port === n.port ? '' : ':' + n.port)),
                n
              )
            }
          },
          function (e, t) {
            var c =
                /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
              p = [
                'source',
                'protocol',
                'authority',
                'userInfo',
                'user',
                'password',
                'host',
                'port',
                'relative',
                'path',
                'directory',
                'file',
                'query',
                'anchor'
              ]
            e.exports = function (e) {
              var t = e,
                n = e.indexOf('['),
                o = e.indexOf(']')
              ;-1 != n &&
                -1 != o &&
                (e =
                  e.substring(0, n) +
                  e.substring(n, o).replace(/:/g, ';') +
                  e.substring(o, e.length))
              for (var r, i = c.exec(e || ''), s = {}, a = 14; a--; )
                s[p[a]] = i[a] || ''
              return (
                -1 != n &&
                  -1 != o &&
                  ((s.source = t),
                  (s.host = s.host
                    .substring(1, s.host.length - 1)
                    .replace(/;/g, ':')),
                  (s.authority = s.authority
                    .replace('[', '')
                    .replace(']', '')
                    .replace(/;/g, ':')),
                  (s.ipv6uri = !0)),
                (s.pathNames =
                  ((o = s.path),
                  (t = o.replace(/\/{2,9}/g, '/').split('/')),
                  ('/' != o.substr(0, 1) && 0 !== o.length) || t.splice(0, 1),
                  '/' == o.substr(o.length - 1, 1) && t.splice(t.length - 1, 1),
                  t)),
                (s.queryKey =
                  ((t = s.query),
                  (r = {}),
                  t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function (e, t, n) {
                    t && (r[t] = n)
                  }),
                  r)),
                s
              )
            }
          },
          function (o, r, i) {
            !function (t) {
              'use strict'
              function e() {
                var e
                try {
                  e = r.storage.debug
                } catch (e) {}
                return (e = !e && void 0 !== t && 'env' in t ? t.env.DEBUG : e)
              }
              var n =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                  ? function (e) {
                      return typeof e
                    }
                  : function (e) {
                      return e &&
                        'function' == typeof Symbol &&
                        e.constructor === Symbol &&
                        e !== Symbol.prototype
                        ? 'symbol'
                        : typeof e
                    }
              ;((r = o.exports = i(5)).log = function () {
                return (
                  'object' ===
                    ('undefined' == typeof console
                      ? 'undefined'
                      : n(console)) &&
                  console.log &&
                  Function.prototype.apply.call(console.log, console, arguments)
                )
              }),
                (r.formatArgs = function (e) {
                  var t,
                    n,
                    o = this.useColors
                  ;(e[0] =
                    (o ? '%c' : '') +
                    this.namespace +
                    (o ? ' %c' : ' ') +
                    e[0] +
                    (o ? '%c ' : ' ') +
                    '+' +
                    r.humanize(this.diff)),
                    o &&
                      ((o = 'color: ' + this.color),
                      e.splice(1, 0, o, 'color: inherit'),
                      e[(n = t = 0)].replace(/%[a-zA-Z%]/g, function (e) {
                        '%%' !== e && (t++, '%c' === e && (n = t))
                      }),
                      e.splice(n, 0, o))
                }),
                (r.save = function (e) {
                  try {
                    null == e
                      ? r.storage.removeItem('debug')
                      : (r.storage.debug = e)
                  } catch (e) {}
                }),
                (r.load = e),
                (r.useColors = function () {
                  return (
                    !(
                      'undefined' == typeof window ||
                      !window.process ||
                      'renderer' !== window.process.type
                    ) ||
                    (('undefined' == typeof navigator ||
                      !navigator.userAgent ||
                      !navigator.userAgent
                        .toLowerCase()
                        .match(/(edge|trident)\/(\d+)/)) &&
                      (('undefined' != typeof document &&
                        document.documentElement &&
                        document.documentElement.style &&
                        document.documentElement.style.WebkitAppearance) ||
                        ('undefined' != typeof window &&
                          window.console &&
                          (window.console.firebug ||
                            (window.console.exception &&
                              window.console.table))) ||
                        ('undefined' != typeof navigator &&
                          navigator.userAgent &&
                          navigator.userAgent
                            .toLowerCase()
                            .match(/firefox\/(\d+)/) &&
                          31 <= parseInt(RegExp.$1, 10)) ||
                        ('undefined' != typeof navigator &&
                          navigator.userAgent &&
                          navigator.userAgent
                            .toLowerCase()
                            .match(/applewebkit\/(\d+)/))))
                  )
                }),
                (r.storage =
                  'undefined' != typeof chrome && void 0 !== chrome.storage
                    ? chrome.storage.local
                    : (function () {
                        try {
                          return window.localStorage
                        } catch (e) {}
                      })()),
                (r.colors = [
                  '#0000CC',
                  '#0000FF',
                  '#0033CC',
                  '#0033FF',
                  '#0066CC',
                  '#0066FF',
                  '#0099CC',
                  '#0099FF',
                  '#00CC00',
                  '#00CC33',
                  '#00CC66',
                  '#00CC99',
                  '#00CCCC',
                  '#00CCFF',
                  '#3300CC',
                  '#3300FF',
                  '#3333CC',
                  '#3333FF',
                  '#3366CC',
                  '#3366FF',
                  '#3399CC',
                  '#3399FF',
                  '#33CC00',
                  '#33CC33',
                  '#33CC66',
                  '#33CC99',
                  '#33CCCC',
                  '#33CCFF',
                  '#6600CC',
                  '#6600FF',
                  '#6633CC',
                  '#6633FF',
                  '#66CC00',
                  '#66CC33',
                  '#9900CC',
                  '#9900FF',
                  '#9933CC',
                  '#9933FF',
                  '#99CC00',
                  '#99CC33',
                  '#CC0000',
                  '#CC0033',
                  '#CC0066',
                  '#CC0099',
                  '#CC00CC',
                  '#CC00FF',
                  '#CC3300',
                  '#CC3333',
                  '#CC3366',
                  '#CC3399',
                  '#CC33CC',
                  '#CC33FF',
                  '#CC6600',
                  '#CC6633',
                  '#CC9900',
                  '#CC9933',
                  '#CCCC00',
                  '#CCCC33',
                  '#FF0000',
                  '#FF0033',
                  '#FF0066',
                  '#FF0099',
                  '#FF00CC',
                  '#FF00FF',
                  '#FF3300',
                  '#FF3333',
                  '#FF3366',
                  '#FF3399',
                  '#FF33CC',
                  '#FF33FF',
                  '#FF6600',
                  '#FF6633',
                  '#FF9900',
                  '#FF9933',
                  '#FFCC00',
                  '#FFCC33'
                ]),
                (r.formatters.j = function (e) {
                  try {
                    return JSON.stringify(e)
                  } catch (e) {
                    return '[UnexpectedJSONParseError]: ' + e.message
                  }
                }),
                r.enable(e())
            }.call(r, i(4))
          },
          function (e, t) {
            function n() {
              throw new Error('setTimeout has not been defined')
            }
            function o() {
              throw new Error('clearTimeout has not been defined')
            }
            function r(t) {
              if (p === setTimeout) return setTimeout(t, 0)
              if ((p === n || !p) && setTimeout)
                return (p = setTimeout), setTimeout(t, 0)
              try {
                return p(t, 0)
              } catch (e) {
                try {
                  return p.call(null, t, 0)
                } catch (e) {
                  return p.call(this, t, 0)
                }
              }
            }
            function i() {
              d &&
                h &&
                ((d = !1),
                h.length ? (f = h.concat(f)) : (l = -1),
                f.length && s())
            }
            function s() {
              if (!d) {
                var e = r(i)
                d = !0
                for (var t = f.length; t; ) {
                  for (h = f, f = []; ++l < t; ) h && h[l].run()
                  ;(l = -1), (t = f.length)
                }
                ;(h = null),
                  (d = !1),
                  (function (t) {
                    if (u === clearTimeout) return clearTimeout(t)
                    if ((u === o || !u) && clearTimeout)
                      return (u = clearTimeout), clearTimeout(t)
                    try {
                      u(t)
                    } catch (e) {
                      try {
                        return u.call(null, t)
                      } catch (e) {
                        return u.call(this, t)
                      }
                    }
                  })(e)
              }
            }
            function a(e, t) {
              ;(this.fun = e), (this.array = t)
            }
            function c() {}
            var p,
              u,
              e = (e.exports = {})
            !(function () {
              try {
                p = 'function' == typeof setTimeout ? setTimeout : n
              } catch (e) {
                p = n
              }
              try {
                u = 'function' == typeof clearTimeout ? clearTimeout : o
              } catch (e) {
                u = o
              }
            })()
            var h,
              f = [],
              d = !1,
              l = -1
            ;(e.nextTick = function (e) {
              var t = new Array(arguments.length - 1)
              if (1 < arguments.length)
                for (var n = 1; n < arguments.length; n++)
                  t[n - 1] = arguments[n]
              f.push(new a(e, t)), 1 !== f.length || d || r(s)
            }),
              (a.prototype.run = function () {
                this.fun.apply(null, this.array)
              }),
              (e.title = 'browser'),
              (e.browser = !0),
              (e.env = {}),
              (e.argv = []),
              (e.version = ''),
              (e.versions = {}),
              (e.on = c),
              (e.addListener = c),
              (e.once = c),
              (e.off = c),
              (e.removeListener = c),
              (e.removeAllListeners = c),
              (e.emit = c),
              (e.prependListener = c),
              (e.prependOnceListener = c),
              (e.listeners = function (e) {
                return []
              }),
              (e.binding = function (e) {
                throw new Error('process.binding is not supported')
              }),
              (e.cwd = function () {
                return '/'
              }),
              (e.chdir = function (e) {
                throw new Error('process.chdir is not supported')
              }),
              (e.umask = function () {
                return 0
              })
          },
          function (e, a, t) {
            'use strict'
            function n(e) {
              function n() {
                if (n.enabled) {
                  var o = n,
                    e = +new Date()
                  ;(o.diff = e - (s || e)), (o.prev = s), (o.curr = e), (s = e)
                  for (
                    var r = new Array(arguments.length), t = 0;
                    t < r.length;
                    t++
                  )
                    r[t] = arguments[t]
                  ;(r[0] = a.coerce(r[0])),
                    'string' != typeof r[0] && r.unshift('%O')
                  var i = 0
                  ;(r[0] = r[0].replace(/%([a-zA-Z%])/g, function (e, t) {
                    if ('%%' === e) return e
                    i++
                    var n = a.formatters[t]
                    return (
                      'function' == typeof n &&
                        ((t = r[i]), (e = n.call(o, t)), r.splice(i, 1), i--),
                      e
                    )
                  })),
                    a.formatArgs.call(o, r),
                    (n.log || a.log || console.log.bind(console)).apply(o, r)
                }
              }
              var s
              return (
                (n.namespace = e),
                (n.enabled = a.enabled(e)),
                (n.useColors = a.useColors()),
                (n.color = (function (e) {
                  var t,
                    n = 0
                  for (t in e) (n = (n << 5) - n + e.charCodeAt(t)), (n |= 0)
                  return a.colors[Math.abs(n) % a.colors.length]
                })(e)),
                (n.destroy = o),
                'function' == typeof a.init && a.init(n),
                a.instances.push(n),
                n
              )
            }
            function o() {
              var e = a.instances.indexOf(this)
              return -1 !== e && (a.instances.splice(e, 1), !0)
            }
            ;((a = e.exports = n.debug = n.default = n).coerce = function (e) {
              return e instanceof Error ? e.stack || e.message : e
            }),
              (a.disable = function () {
                a.enable('')
              }),
              (a.enable = function (e) {
                a.save(e), (a.names = []), (a.skips = [])
                for (
                  var t = ('string' == typeof e ? e : '').split(/[\s,]+/),
                    n = t.length,
                    o = 0;
                  o < n;
                  o++
                )
                  t[o] &&
                    ('-' === (e = t[o].replace(/\*/g, '.*?'))[0]
                      ? a.skips.push(new RegExp('^' + e.substr(1) + '$'))
                      : a.names.push(new RegExp('^' + e + '$')))
                for (o = 0; o < a.instances.length; o++) {
                  var r = a.instances[o]
                  r.enabled = a.enabled(r.namespace)
                }
              }),
              (a.enabled = function (e) {
                if ('*' === e[e.length - 1]) return !0
                for (var t = 0, n = a.skips.length; t < n; t++)
                  if (a.skips[t].test(e)) return !1
                for (t = 0, n = a.names.length; t < n; t++)
                  if (a.names[t].test(e)) return !0
                return !1
              }),
              (a.humanize = t(6)),
              (a.instances = []),
              (a.names = []),
              (a.skips = []),
              (a.formatters = {})
          },
          function (e, t) {
            function r(e, t, n) {
              if (!(e < t))
                return e < 1.5 * t
                  ? Math.floor(e / t) + ' ' + n
                  : Math.ceil(e / t) + ' ' + n + 's'
            }
            var i = 36e5,
              s = 864e5
            e.exports = function (e, t) {
              t = t || {}
              var n,
                o = typeof e
              if ('string' == o && 0 < e.length)
                return (function (e) {
                  if (!(100 < (e = String(e)).length)) {
                    e =
                      /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                        e
                      )
                    if (e) {
                      var t = parseFloat(e[1])
                      switch ((e[2] || 'ms').toLowerCase()) {
                        case 'years':
                        case 'year':
                        case 'yrs':
                        case 'yr':
                        case 'y':
                          return 315576e5 * t
                        case 'days':
                        case 'day':
                        case 'd':
                          return t * s
                        case 'hours':
                        case 'hour':
                        case 'hrs':
                        case 'hr':
                        case 'h':
                          return t * i
                        case 'minutes':
                        case 'minute':
                        case 'mins':
                        case 'min':
                        case 'm':
                          return 6e4 * t
                        case 'seconds':
                        case 'second':
                        case 'secs':
                        case 'sec':
                        case 's':
                          return 1e3 * t
                        case 'milliseconds':
                        case 'millisecond':
                        case 'msecs':
                        case 'msec':
                        case 'ms':
                          return t
                        default:
                          return
                      }
                    }
                  }
                })(e)
              if ('number' == o && !1 === isNaN(e))
                return t.long
                  ? r((n = e), s, 'day') ||
                      r(n, i, 'hour') ||
                      r(n, 6e4, 'minute') ||
                      r(n, 1e3, 'second') ||
                      n + ' ms'
                  : s <= (n = e)
                  ? Math.round(n / s) + 'd'
                  : i <= n
                  ? Math.round(n / i) + 'h'
                  : 6e4 <= n
                  ? Math.round(n / 6e4) + 'm'
                  : 1e3 <= n
                  ? Math.round(n / 1e3) + 's'
                  : n + 'ms'
              throw new Error(
                'val is not a non-empty string or a valid number. val=' +
                  JSON.stringify(e)
              )
            }
          },
          function (e, s, t) {
            function n() {}
            function o(e) {
              var t = '' + e.type
              if (
                ((s.BINARY_EVENT !== e.type && s.BINARY_ACK !== e.type) ||
                  (t += e.attachments + '-'),
                e.nsp && '/' !== e.nsp && (t += e.nsp + ','),
                null != e.id && (t += e.id),
                null != e.data)
              ) {
                var n = (function (e) {
                  try {
                    return JSON.stringify(e)
                  } catch (e) {
                    return !1
                  }
                })(e.data)
                if (!1 === n) return y
                t += n
              }
              return u('encoded %j as %s', e, t), t
            }
            function r(e, n) {
              f.removeBlobs(e, function (e) {
                var t = f.deconstructPacket(e),
                  e = o(t.packet)
                ;(t = t.buffers).unshift(e), n(t)
              })
            }
            function i() {
              this.reconstructor = null
            }
            function a(e) {
              var t = 0,
                n = { type: Number(e.charAt(0)) }
              if (null == s.types[n.type])
                return p('unknown packet type ' + n.type)
              if (s.BINARY_EVENT === n.type || s.BINARY_ACK === n.type) {
                for (
                  var o = '';
                  '-' !== e.charAt(++t) && ((o += e.charAt(t)), t != e.length);

                );
                if (o != Number(o) || '-' !== e.charAt(t))
                  throw new Error('Illegal attachments')
                n.attachments = Number(o)
              }
              if ('/' === e.charAt(t + 1))
                for (n.nsp = ''; ++t; ) {
                  if (',' === (r = e.charAt(t))) break
                  if (((n.nsp += r), t === e.length)) break
                }
              else n.nsp = '/'
              var r,
                i = e.charAt(t + 1)
              if ('' !== i && Number(i) == i) {
                for (n.id = ''; ++t; ) {
                  if (null == (r = e.charAt(t)) || Number(r) != r) {
                    --t
                    break
                  }
                  if (((n.id += e.charAt(t)), t === e.length)) break
                }
                n.id = Number(n.id)
              }
              if (e.charAt(++t)) {
                i = (function (e) {
                  try {
                    return JSON.parse(e)
                  } catch (e) {
                    return !1
                  }
                })(e.substr(t))
                if (!(!1 !== i && (n.type === s.ERROR || d(i))))
                  return p('invalid payload')
                n.data = i
              }
              return u('decoded %s as %j', e, n), n
            }
            function c(e) {
              ;(this.reconPack = e), (this.buffers = [])
            }
            function p(e) {
              return { type: s.ERROR, data: 'parser error: ' + e }
            }
            var u = t(3)('socket.io-parser'),
              h = t(8),
              f = t(9),
              d = t(10),
              l = t(11)
            ;(s.protocol = 4),
              (s.types = [
                'CONNECT',
                'DISCONNECT',
                'EVENT',
                'ACK',
                'ERROR',
                'BINARY_EVENT',
                'BINARY_ACK'
              ]),
              (s.CONNECT = 0),
              (s.DISCONNECT = 1),
              (s.EVENT = 2),
              (s.ACK = 3),
              (s.ERROR = 4),
              (s.BINARY_EVENT = 5),
              (s.BINARY_ACK = 6),
              (s.Encoder = n),
              (s.Decoder = i)
            var y = s.ERROR + '"encode error"'
            ;(n.prototype.encode = function (e, t) {
              u('encoding packet %j', e),
                s.BINARY_EVENT === e.type || s.BINARY_ACK === e.type
                  ? r(e, t)
                  : t([o(e)])
            }),
              h(i.prototype),
              (i.prototype.add = function (e) {
                var t
                if ('string' == typeof e)
                  (t = a(e)),
                    s.BINARY_EVENT === t.type || s.BINARY_ACK === t.type
                      ? ((this.reconstructor = new c(t)),
                        0 === this.reconstructor.reconPack.attachments &&
                          this.emit('decoded', t))
                      : this.emit('decoded', t)
                else {
                  if (!l(e) && !e.base64) throw new Error('Unknown type: ' + e)
                  if (!this.reconstructor)
                    throw new Error(
                      'got binary data when not reconstructing a packet'
                    )
                  ;(t = this.reconstructor.takeBinaryData(e)) &&
                    ((this.reconstructor = null), this.emit('decoded', t))
                }
              }),
              (i.prototype.destroy = function () {
                this.reconstructor &&
                  this.reconstructor.finishedReconstruction()
              }),
              (c.prototype.takeBinaryData = function (e) {
                if (
                  (this.buffers.push(e),
                  this.buffers.length !== this.reconPack.attachments)
                )
                  return null
                e = f.reconstructPacket(this.reconPack, this.buffers)
                return this.finishedReconstruction(), e
              }),
              (c.prototype.finishedReconstruction = function () {
                ;(this.reconPack = null), (this.buffers = [])
              })
          },
          function (e, t, n) {
            function o(e) {
              if (e)
                return (function (e) {
                  for (var t in o.prototype) e[t] = o.prototype[t]
                  return e
                })(e)
            }
            ;((e.exports = o).prototype.on = o.prototype.addEventListener =
              function (e, t) {
                return (
                  (this._callbacks = this._callbacks || {}),
                  (this._callbacks['$' + e] =
                    this._callbacks['$' + e] || []).push(t),
                  this
                )
              }),
              (o.prototype.once = function (e, t) {
                function n() {
                  this.off(e, n), t.apply(this, arguments)
                }
                return (n.fn = t), this.on(e, n), this
              }),
              (o.prototype.off =
                o.prototype.removeListener =
                o.prototype.removeAllListeners =
                o.prototype.removeEventListener =
                  function (e, t) {
                    if (
                      ((this._callbacks = this._callbacks || {}),
                      0 == arguments.length)
                    )
                      return (this._callbacks = {}), this
                    var n = this._callbacks['$' + e]
                    if (!n) return this
                    if (1 == arguments.length)
                      return delete this._callbacks['$' + e], this
                    for (var o, r = 0; r < n.length; r++)
                      if ((o = n[r]) === t || o.fn === t) {
                        n.splice(r, 1)
                        break
                      }
                    return (
                      0 === n.length && delete this._callbacks['$' + e], this
                    )
                  }),
              (o.prototype.emit = function (e) {
                this._callbacks = this._callbacks || {}
                for (
                  var t = new Array(arguments.length - 1),
                    n = this._callbacks['$' + e],
                    o = 1;
                  o < arguments.length;
                  o++
                )
                  t[o - 1] = arguments[o]
                if (n)
                  for (var o = 0, r = (n = n.slice(0)).length; o < r; ++o)
                    n[o].apply(this, t)
                return this
              }),
              (o.prototype.listeners = function (e) {
                return (
                  (this._callbacks = this._callbacks || {}),
                  this._callbacks['$' + e] || []
                )
              }),
              (o.prototype.hasListeners = function (e) {
                return !!this.listeners(e).length
              })
          },
          function (e, t, n) {
            var u = n(10),
              h = n(11),
              n = Object.prototype.toString,
              f =
                'function' == typeof Blob ||
                ('undefined' != typeof Blob &&
                  '[object BlobConstructor]' === n.call(Blob)),
              d =
                'function' == typeof File ||
                ('undefined' != typeof File &&
                  '[object FileConstructor]' === n.call(File))
            ;(t.deconstructPacket = function (e) {
              var t = [],
                n = e.data,
                e = e
              return (
                (e.data = (function e(t, n) {
                  if (!t) return t
                  if (h(t)) {
                    var o = { _placeholder: !0, num: n.length }
                    return n.push(t), o
                  }
                  if (u(t)) {
                    for (var r = new Array(t.length), i = 0; i < t.length; i++)
                      r[i] = e(t[i], n)
                    return r
                  }
                  if ('object' != typeof t || t instanceof Date) return t
                  var s,
                    r = {}
                  for (s in t) r[s] = e(t[s], n)
                  return r
                })(n, t)),
                (e.attachments = t.length),
                { packet: e, buffers: t }
              )
            }),
              (t.reconstructPacket = function (e, t) {
                return (
                  (e.data = (function e(t, n) {
                    if (!t) return t
                    if (t && t._placeholder) return n[t.num]
                    if (u(t))
                      for (var o = 0; o < t.length; o++) t[o] = e(t[o], n)
                    else if ('object' == typeof t)
                      for (var r in t) t[r] = e(t[r], n)
                    return t
                  })(e.data, t)),
                  (e.attachments = void 0),
                  e
                )
              }),
              (t.removeBlobs = function (e, a) {
                var c = 0,
                  p = e
                ;(function e(t, n, o) {
                  if (!t) return t
                  if ((f && t instanceof Blob) || (d && t instanceof File)) {
                    c++
                    var r = new FileReader()
                    ;(r.onload = function () {
                      o ? (o[n] = this.result) : (p = this.result), --c || a(p)
                    }),
                      r.readAsArrayBuffer(t)
                  } else if (u(t))
                    for (var i = 0; i < t.length; i++) e(t[i], i, t)
                  else if ('object' == typeof t && !h(t))
                    for (var s in t) e(t[s], s, t)
                })(p),
                  c || a(p)
              })
          },
          function (e, t) {
            var n = {}.toString
            e.exports =
              Array.isArray ||
              function (e) {
                return '[object Array]' == n.call(e)
              }
          },
          function (e, t) {
            e.exports = function (e) {
              return (
                (n && Buffer.isBuffer(e)) ||
                (o && (e instanceof ArrayBuffer || r(e)))
              )
            }
            var n =
                'function' == typeof Buffer &&
                'function' == typeof Buffer.isBuffer,
              o = 'function' == typeof ArrayBuffer,
              r = function (e) {
                return 'function' == typeof ArrayBuffer.isView
                  ? ArrayBuffer.isView(e)
                  : e.buffer instanceof ArrayBuffer
              }
          },
          function (e, t, n) {
            function o(e, t) {
              if (!(this instanceof o)) return new o(e, t)
              e && 'object' == typeof e && ((t = e), (e = void 0)),
                ((t = t || {}).path = t.path || '/socket.io'),
                (this.nsps = {}),
                (this.subs = []),
                (this.opts = t),
                this.reconnection(!1 !== t.reconnection),
                this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0),
                this.reconnectionDelay(t.reconnectionDelay || 1e3),
                this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3),
                this.randomizationFactor(t.randomizationFactor || 0.5),
                (this.backoff = new f({
                  min: this.reconnectionDelay(),
                  max: this.reconnectionDelayMax(),
                  jitter: this.randomizationFactor()
                })),
                this.timeout(null == t.timeout ? 2e4 : t.timeout),
                (this.readyState = 'closed'),
                (this.uri = e),
                (this.connecting = []),
                (this.lastPing = null),
                (this.encoding = !1),
                (this.packetBuffer = [])
              e = t.parser || s
              ;(this.encoder = new e.Encoder()),
                (this.decoder = new e.Decoder()),
                (this.autoConnect = !1 !== t.autoConnect),
                this.autoConnect && this.open()
            }
            var c = n(13),
              i = n(37),
              r = n(8),
              s = n(7),
              p = n(39),
              a = n(40),
              u = n(3)('socket.io-client:manager'),
              h = n(36),
              f = n(41),
              d = Object.prototype.hasOwnProperty
            ;((e.exports = o).prototype.emitAll = function () {
              for (var e in (this.emit.apply(this, arguments), this.nsps))
                d.call(this.nsps, e) &&
                  this.nsps[e].emit.apply(this.nsps[e], arguments)
            }),
              (o.prototype.updateSocketIds = function () {
                for (var e in this.nsps)
                  d.call(this.nsps, e) && (this.nsps[e].id = this.generateId(e))
              }),
              (o.prototype.generateId = function (e) {
                return ('/' === e ? '' : e + '#') + this.engine.id
              }),
              r(o.prototype),
              (o.prototype.reconnection = function (e) {
                return arguments.length
                  ? ((this._reconnection = !!e), this)
                  : this._reconnection
              }),
              (o.prototype.reconnectionAttempts = function (e) {
                return arguments.length
                  ? ((this._reconnectionAttempts = e), this)
                  : this._reconnectionAttempts
              }),
              (o.prototype.reconnectionDelay = function (e) {
                return arguments.length
                  ? ((this._reconnectionDelay = e),
                    this.backoff && this.backoff.setMin(e),
                    this)
                  : this._reconnectionDelay
              }),
              (o.prototype.randomizationFactor = function (e) {
                return arguments.length
                  ? ((this._randomizationFactor = e),
                    this.backoff && this.backoff.setJitter(e),
                    this)
                  : this._randomizationFactor
              }),
              (o.prototype.reconnectionDelayMax = function (e) {
                return arguments.length
                  ? ((this._reconnectionDelayMax = e),
                    this.backoff && this.backoff.setMax(e),
                    this)
                  : this._reconnectionDelayMax
              }),
              (o.prototype.timeout = function (e) {
                return arguments.length
                  ? ((this._timeout = e), this)
                  : this._timeout
              }),
              (o.prototype.maybeReconnectOnOpen = function () {
                !this.reconnecting &&
                  this._reconnection &&
                  0 === this.backoff.attempts &&
                  this.reconnect()
              }),
              (o.prototype.open = o.prototype.connect =
                function (n, e) {
                  if (
                    (u('readyState %s', this.readyState),
                    ~this.readyState.indexOf('open'))
                  )
                    return this
                  u('opening %s', this.uri),
                    (this.engine = c(this.uri, this.opts))
                  var t = this.engine,
                    o = this
                  ;(this.readyState = 'opening'), (this.skipReconnect = !1)
                  var r,
                    i,
                    s = p(t, 'open', function () {
                      o.onopen(), n && n()
                    }),
                    a = p(t, 'error', function (e) {
                      var t
                      u('connect_error'),
                        o.cleanup(),
                        (o.readyState = 'closed'),
                        o.emitAll('connect_error', e),
                        n
                          ? (((t = new Error('Connection error')).data = e),
                            n(t))
                          : o.maybeReconnectOnOpen()
                    })
                  return (
                    !1 !== this._timeout &&
                      ((r = this._timeout),
                      u('connect attempt will timeout after %d', r),
                      0 === r && s.destroy(),
                      (i = setTimeout(function () {
                        u('connect attempt timed out after %d', r),
                          s.destroy(),
                          t.close(),
                          t.emit('error', 'timeout'),
                          o.emitAll('connect_timeout', r)
                      }, r)),
                      this.subs.push({
                        destroy: function () {
                          clearTimeout(i)
                        }
                      })),
                    this.subs.push(s),
                    this.subs.push(a),
                    this
                  )
                }),
              (o.prototype.onopen = function () {
                u('open'),
                  this.cleanup(),
                  (this.readyState = 'open'),
                  this.emit('open')
                var e = this.engine
                this.subs.push(p(e, 'data', a(this, 'ondata'))),
                  this.subs.push(p(e, 'ping', a(this, 'onping'))),
                  this.subs.push(p(e, 'pong', a(this, 'onpong'))),
                  this.subs.push(p(e, 'error', a(this, 'onerror'))),
                  this.subs.push(p(e, 'close', a(this, 'onclose'))),
                  this.subs.push(
                    p(this.decoder, 'decoded', a(this, 'ondecoded'))
                  )
              }),
              (o.prototype.onping = function () {
                ;(this.lastPing = new Date()), this.emitAll('ping')
              }),
              (o.prototype.onpong = function () {
                this.emitAll('pong', new Date() - this.lastPing)
              }),
              (o.prototype.ondata = function (e) {
                this.decoder.add(e)
              }),
              (o.prototype.ondecoded = function (e) {
                this.emit('packet', e)
              }),
              (o.prototype.onerror = function (e) {
                u('error', e), this.emitAll('error', e)
              }),
              (o.prototype.socket = function (e, t) {
                function n() {
                  ~h(o.connecting, r) || o.connecting.push(r)
                }
                var o,
                  r = this.nsps[e]
                return (
                  r ||
                    ((r = new i(this, e, t)),
                    (this.nsps[e] = r),
                    (o = this),
                    r.on('connecting', n),
                    r.on('connect', function () {
                      r.id = o.generateId(e)
                    }),
                    this.autoConnect && n()),
                  r
                )
              }),
              (o.prototype.destroy = function (e) {
                e = h(this.connecting, e)
                ~e && this.connecting.splice(e, 1),
                  this.connecting.length || this.close()
              }),
              (o.prototype.packet = function (n) {
                u('writing packet %j', n)
                var o = this
                n.query && 0 === n.type && (n.nsp += '?' + n.query),
                  o.encoding
                    ? o.packetBuffer.push(n)
                    : ((o.encoding = !0),
                      this.encoder.encode(n, function (e) {
                        for (var t = 0; t < e.length; t++)
                          o.engine.write(e[t], n.options)
                        ;(o.encoding = !1), o.processPacketQueue()
                      }))
              }),
              (o.prototype.processPacketQueue = function () {
                var e
                0 < this.packetBuffer.length &&
                  !this.encoding &&
                  ((e = this.packetBuffer.shift()), this.packet(e))
              }),
              (o.prototype.cleanup = function () {
                u('cleanup')
                for (var e = this.subs.length, t = 0; t < e; t++)
                  this.subs.shift().destroy()
                ;(this.packetBuffer = []),
                  (this.encoding = !1),
                  (this.lastPing = null),
                  this.decoder.destroy()
              }),
              (o.prototype.close = o.prototype.disconnect =
                function () {
                  u('disconnect'),
                    (this.skipReconnect = !0),
                    (this.reconnecting = !1),
                    'opening' === this.readyState && this.cleanup(),
                    this.backoff.reset(),
                    (this.readyState = 'closed'),
                    this.engine && this.engine.close()
                }),
              (o.prototype.onclose = function (e) {
                u('onclose'),
                  this.cleanup(),
                  this.backoff.reset(),
                  (this.readyState = 'closed'),
                  this.emit('close', e),
                  this._reconnection && !this.skipReconnect && this.reconnect()
              }),
              (o.prototype.reconnect = function () {
                if (this.reconnecting || this.skipReconnect) return this
                var e,
                  t,
                  n = this
                this.backoff.attempts >= this._reconnectionAttempts
                  ? (u('reconnect failed'),
                    this.backoff.reset(),
                    this.emitAll('reconnect_failed'),
                    (this.reconnecting = !1))
                  : ((e = this.backoff.duration()),
                    u('will wait %dms before reconnect attempt', e),
                    (this.reconnecting = !0),
                    (t = setTimeout(function () {
                      n.skipReconnect ||
                        (u('attempting reconnect'),
                        n.emitAll('reconnect_attempt', n.backoff.attempts),
                        n.emitAll('reconnecting', n.backoff.attempts),
                        n.skipReconnect ||
                          n.open(function (e) {
                            e
                              ? (u('reconnect attempt error'),
                                (n.reconnecting = !1),
                                n.reconnect(),
                                n.emitAll('reconnect_error', e.data))
                              : (u('reconnect success'), n.onreconnect())
                          }))
                    }, e)),
                    this.subs.push({
                      destroy: function () {
                        clearTimeout(t)
                      }
                    }))
              }),
              (o.prototype.onreconnect = function () {
                var e = this.backoff.attempts
                ;(this.reconnecting = !1),
                  this.backoff.reset(),
                  this.updateSocketIds(),
                  this.emitAll('reconnect', e)
              })
          },
          function (e, t, n) {
            ;(e.exports = n(14)), (e.exports.parser = n(22))
          },
          function (e, t, n) {
            function h(e, t) {
              return this instanceof h
                ? ((t = t || {}),
                  e && 'object' == typeof e && ((t = e), (e = null)),
                  e
                    ? ((e = a(e)),
                      (t.hostname = e.host),
                      (t.secure =
                        'https' === e.protocol || 'wss' === e.protocol),
                      (t.port = e.port),
                      e.query && (t.query = e.query))
                    : t.host && (t.hostname = a(t.host).host),
                  (this.secure =
                    null != t.secure
                      ? t.secure
                      : 'undefined' != typeof location &&
                        'https:' === location.protocol),
                  t.hostname &&
                    !t.port &&
                    (t.port = this.secure ? '443' : '80'),
                  (this.agent = t.agent || !1),
                  (this.hostname =
                    t.hostname ||
                    ('undefined' != typeof location
                      ? location.hostname
                      : 'localhost')),
                  (this.port =
                    t.port ||
                    ('undefined' != typeof location && location.port
                      ? location.port
                      : this.secure
                      ? 443
                      : 80)),
                  (this.query = t.query || {}),
                  'string' == typeof this.query &&
                    (this.query = c.decode(this.query)),
                  (this.upgrade = !1 !== t.upgrade),
                  (this.path =
                    (t.path || '/engine.io').replace(/\/$/, '') + '/'),
                  (this.forceJSONP = !!t.forceJSONP),
                  (this.jsonp = !1 !== t.jsonp),
                  (this.forceBase64 = !!t.forceBase64),
                  (this.enablesXDR = !!t.enablesXDR),
                  (this.withCredentials = !1 !== t.withCredentials),
                  (this.timestampParam = t.timestampParam || 't'),
                  (this.timestampRequests = t.timestampRequests),
                  (this.transports = t.transports || ['polling', 'websocket']),
                  (this.transportOptions = t.transportOptions || {}),
                  (this.readyState = ''),
                  (this.writeBuffer = []),
                  (this.prevBufferLen = 0),
                  (this.policyPort = t.policyPort || 843),
                  (this.rememberUpgrade = t.rememberUpgrade || !1),
                  (this.binaryType = null),
                  (this.onlyBinaryUpgrades = t.onlyBinaryUpgrades),
                  (this.perMessageDeflate =
                    !1 !== t.perMessageDeflate && (t.perMessageDeflate || {})),
                  !0 === this.perMessageDeflate &&
                    (this.perMessageDeflate = {}),
                  this.perMessageDeflate &&
                    null == this.perMessageDeflate.threshold &&
                    (this.perMessageDeflate.threshold = 1024),
                  (this.pfx = t.pfx || null),
                  (this.key = t.key || null),
                  (this.passphrase = t.passphrase || null),
                  (this.cert = t.cert || null),
                  (this.ca = t.ca || null),
                  (this.ciphers = t.ciphers || null),
                  (this.rejectUnauthorized =
                    void 0 === t.rejectUnauthorized || t.rejectUnauthorized),
                  (this.forceNode = !!t.forceNode),
                  (this.isReactNative =
                    'undefined' != typeof navigator &&
                    'string' == typeof navigator.product &&
                    'reactnative' === navigator.product.toLowerCase()),
                  ('undefined' != typeof self && !this.isReactNative) ||
                    (t.extraHeaders &&
                      0 < Object.keys(t.extraHeaders).length &&
                      (this.extraHeaders = t.extraHeaders),
                    t.localAddress && (this.localAddress = t.localAddress)),
                  (this.id = null),
                  (this.upgrades = null),
                  (this.pingInterval = null),
                  (this.pingTimeout = null),
                  (this.pingIntervalTimer = null),
                  (this.pingTimeoutTimer = null),
                  void this.open())
                : new h(e, t)
            }
            var o = n(15),
              r = n(8),
              f = n(3)('engine.io-client:socket'),
              i = n(36),
              s = n(22),
              a = n(2),
              c = n(30)
            ;((e.exports = h).priorWebsocketSuccess = !1),
              r(h.prototype),
              (h.protocol = s.protocol),
              ((h.Socket = h).Transport = n(21)),
              (h.transports = n(15)),
              (h.parser = n(22)),
              (h.prototype.createTransport = function (e) {
                f('creating transport "%s"', e)
                var t = (function (e) {
                  var t,
                    n = {}
                  for (t in e) e.hasOwnProperty(t) && (n[t] = e[t])
                  return n
                })(this.query)
                ;(t.EIO = s.protocol), (t.transport = e)
                var n = this.transportOptions[e] || {}
                return (
                  this.id && (t.sid = this.id),
                  new o[e]({
                    query: t,
                    socket: this,
                    agent: n.agent || this.agent,
                    hostname: n.hostname || this.hostname,
                    port: n.port || this.port,
                    secure: n.secure || this.secure,
                    path: n.path || this.path,
                    forceJSONP: n.forceJSONP || this.forceJSONP,
                    jsonp: n.jsonp || this.jsonp,
                    forceBase64: n.forceBase64 || this.forceBase64,
                    enablesXDR: n.enablesXDR || this.enablesXDR,
                    withCredentials: n.withCredentials || this.withCredentials,
                    timestampRequests:
                      n.timestampRequests || this.timestampRequests,
                    timestampParam: n.timestampParam || this.timestampParam,
                    policyPort: n.policyPort || this.policyPort,
                    pfx: n.pfx || this.pfx,
                    key: n.key || this.key,
                    passphrase: n.passphrase || this.passphrase,
                    cert: n.cert || this.cert,
                    ca: n.ca || this.ca,
                    ciphers: n.ciphers || this.ciphers,
                    rejectUnauthorized:
                      n.rejectUnauthorized || this.rejectUnauthorized,
                    perMessageDeflate:
                      n.perMessageDeflate || this.perMessageDeflate,
                    extraHeaders: n.extraHeaders || this.extraHeaders,
                    forceNode: n.forceNode || this.forceNode,
                    localAddress: n.localAddress || this.localAddress,
                    requestTimeout: n.requestTimeout || this.requestTimeout,
                    protocols: n.protocols || void 0,
                    isReactNative: this.isReactNative
                  })
                )
              }),
              (h.prototype.open = function () {
                var e
                if (
                  this.rememberUpgrade &&
                  h.priorWebsocketSuccess &&
                  -1 !== this.transports.indexOf('websocket')
                )
                  e = 'websocket'
                else {
                  if (0 === this.transports.length) {
                    var t = this
                    return void setTimeout(function () {
                      t.emit('error', 'No transports available')
                    }, 0)
                  }
                  e = this.transports[0]
                }
                this.readyState = 'opening'
                try {
                  e = this.createTransport(e)
                } catch (e) {
                  return this.transports.shift(), void this.open()
                }
                e.open(), this.setTransport(e)
              }),
              (h.prototype.setTransport = function (e) {
                f('setting transport %s', e.name)
                var t = this
                this.transport &&
                  (f('clearing existing transport %s', this.transport.name),
                  this.transport.removeAllListeners()),
                  (this.transport = e)
                    .on('drain', function () {
                      t.onDrain()
                    })
                    .on('packet', function (e) {
                      t.onPacket(e)
                    })
                    .on('error', function (e) {
                      t.onError(e)
                    })
                    .on('close', function () {
                      t.onClose('transport close')
                    })
              }),
              (h.prototype.probe = function (n) {
                function e() {
                  var e
                  u.onlyBinaryUpgrades &&
                    ((e = !this.supportsBinary && u.transport.supportsBinary),
                    (p = p || e)),
                    p ||
                      (f('probe transport "%s" opened', n),
                      c.send([{ type: 'ping', data: 'probe' }]),
                      c.once('packet', function (e) {
                        p ||
                          ('pong' === e.type && 'probe' === e.data
                            ? (f('probe transport "%s" pong', n),
                              (u.upgrading = !0),
                              u.emit('upgrading', c),
                              c &&
                                ((h.priorWebsocketSuccess =
                                  'websocket' === c.name),
                                f(
                                  'pausing current transport "%s"',
                                  u.transport.name
                                ),
                                u.transport.pause(function () {
                                  p ||
                                    ('closed' !== u.readyState &&
                                      (f(
                                        'changing transport and sending upgrade packet'
                                      ),
                                      a(),
                                      u.setTransport(c),
                                      c.send([{ type: 'upgrade' }]),
                                      u.emit('upgrade', c),
                                      (c = null),
                                      (u.upgrading = !1),
                                      u.flush()))
                                })))
                            : (f('probe transport "%s" failed', n),
                              ((e = new Error('probe error')).transport =
                                c.name),
                              u.emit('upgradeError', e)))
                      }))
                }
                function o() {
                  p || ((p = !0), a(), c.close(), (c = null))
                }
                function t(e) {
                  var t = new Error('probe error: ' + e)
                  ;(t.transport = c.name),
                    o(),
                    f('probe transport "%s" failed because of error: %s', n, e),
                    u.emit('upgradeError', t)
                }
                function r() {
                  t('transport closed')
                }
                function i() {
                  t('socket closed')
                }
                function s(e) {
                  c &&
                    e.name !== c.name &&
                    (f('"%s" works - aborting "%s"', e.name, c.name), o())
                }
                function a() {
                  c.removeListener('open', e),
                    c.removeListener('error', t),
                    c.removeListener('close', r),
                    u.removeListener('close', i),
                    u.removeListener('upgrading', s)
                }
                f('probing transport "%s"', n)
                var c = this.createTransport(n, { probe: 1 }),
                  p = !1,
                  u = this
                ;(h.priorWebsocketSuccess = !1),
                  c.once('open', e),
                  c.once('error', t),
                  c.once('close', r),
                  this.once('close', i),
                  this.once('upgrading', s),
                  c.open()
              }),
              (h.prototype.onOpen = function () {
                if (
                  (f('socket open'),
                  (this.readyState = 'open'),
                  (h.priorWebsocketSuccess =
                    'websocket' === this.transport.name),
                  this.emit('open'),
                  this.flush(),
                  'open' === this.readyState &&
                    this.upgrade &&
                    this.transport.pause)
                ) {
                  f('starting upgrade probes')
                  for (var e = 0, t = this.upgrades.length; e < t; e++)
                    this.probe(this.upgrades[e])
                }
              }),
              (h.prototype.onPacket = function (e) {
                if (
                  'opening' === this.readyState ||
                  'open' === this.readyState ||
                  'closing' === this.readyState
                )
                  switch (
                    (f('socket receive: type "%s", data "%s"', e.type, e.data),
                    this.emit('packet', e),
                    this.emit('heartbeat'),
                    e.type)
                  ) {
                    case 'open':
                      this.onHandshake(JSON.parse(e.data))
                      break
                    case 'pong':
                      this.setPing(), this.emit('pong')
                      break
                    case 'error':
                      var t = new Error('server error')
                      ;(t.code = e.data), this.onError(t)
                      break
                    case 'message':
                      this.emit('data', e.data), this.emit('message', e.data)
                  }
                else
                  f(
                    'packet received with socket readyState "%s"',
                    this.readyState
                  )
              }),
              (h.prototype.onHandshake = function (e) {
                this.emit('handshake', e),
                  (this.id = e.sid),
                  (this.transport.query.sid = e.sid),
                  (this.upgrades = this.filterUpgrades(e.upgrades)),
                  (this.pingInterval = e.pingInterval),
                  (this.pingTimeout = e.pingTimeout),
                  this.onOpen(),
                  'closed' !== this.readyState &&
                    (this.setPing(),
                    this.removeListener('heartbeat', this.onHeartbeat),
                    this.on('heartbeat', this.onHeartbeat))
              }),
              (h.prototype.onHeartbeat = function (e) {
                clearTimeout(this.pingTimeoutTimer)
                var t = this
                t.pingTimeoutTimer = setTimeout(function () {
                  'closed' !== t.readyState && t.onClose('ping timeout')
                }, e || t.pingInterval + t.pingTimeout)
              }),
              (h.prototype.setPing = function () {
                var e = this
                clearTimeout(e.pingIntervalTimer),
                  (e.pingIntervalTimer = setTimeout(function () {
                    f(
                      'writing ping packet - expecting pong within %sms',
                      e.pingTimeout
                    ),
                      e.ping(),
                      e.onHeartbeat(e.pingTimeout)
                  }, e.pingInterval))
              }),
              (h.prototype.ping = function () {
                var e = this
                this.sendPacket('ping', function () {
                  e.emit('ping')
                })
              }),
              (h.prototype.onDrain = function () {
                this.writeBuffer.splice(0, this.prevBufferLen),
                  (this.prevBufferLen = 0) === this.writeBuffer.length
                    ? this.emit('drain')
                    : this.flush()
              }),
              (h.prototype.flush = function () {
                'closed' !== this.readyState &&
                  this.transport.writable &&
                  !this.upgrading &&
                  this.writeBuffer.length &&
                  (f('flushing %d packets in socket', this.writeBuffer.length),
                  this.transport.send(this.writeBuffer),
                  (this.prevBufferLen = this.writeBuffer.length),
                  this.emit('flush'))
              }),
              (h.prototype.write = h.prototype.send =
                function (e, t, n) {
                  return this.sendPacket('message', e, t, n), this
                }),
              (h.prototype.sendPacket = function (e, t, n, o) {
                'function' == typeof t && ((o = t), (t = void 0)),
                  'function' == typeof n && ((o = n), (n = null)),
                  'closing' !== this.readyState &&
                    'closed' !== this.readyState &&
                    (((n = n || {}).compress = !1 !== n.compress),
                    this.emit(
                      'packetCreate',
                      (n = { type: e, data: t, options: n })
                    ),
                    this.writeBuffer.push(n),
                    o && this.once('flush', o),
                    this.flush())
              }),
              (h.prototype.close = function () {
                function e() {
                  o.onClose('forced close'),
                    f('socket closing - telling transport to close'),
                    o.transport.close()
                }
                function t() {
                  o.removeListener('upgrade', t),
                    o.removeListener('upgradeError', t),
                    e()
                }
                function n() {
                  o.once('upgrade', t), o.once('upgradeError', t)
                }
                var o
                return (
                  ('opening' !== this.readyState &&
                    'open' !== this.readyState) ||
                    ((this.readyState = 'closing'),
                    (o = this).writeBuffer.length
                      ? this.once('drain', function () {
                          ;(this.upgrading ? n : e)()
                        })
                      : (this.upgrading ? n : e)()),
                  this
                )
              }),
              (h.prototype.onError = function (e) {
                f('socket error %j', e),
                  (h.priorWebsocketSuccess = !1),
                  this.emit('error', e),
                  this.onClose('transport error', e)
              }),
              (h.prototype.onClose = function (e, t) {
                ;('opening' !== this.readyState &&
                  'open' !== this.readyState &&
                  'closing' !== this.readyState) ||
                  (f('socket close with reason: "%s"', e),
                  clearTimeout(this.pingIntervalTimer),
                  clearTimeout(this.pingTimeoutTimer),
                  this.transport.removeAllListeners('close'),
                  this.transport.close(),
                  this.transport.removeAllListeners(),
                  (this.readyState = 'closed'),
                  (this.id = null),
                  this.emit('close', e, t),
                  (this.writeBuffer = []),
                  (this.prevBufferLen = 0))
              }),
              (h.prototype.filterUpgrades = function (e) {
                for (var t = [], n = 0, o = e.length; n < o; n++)
                  ~i(this.transports, e[n]) && t.push(e[n])
                return t
              })
          },
          function (e, t, n) {
            var s = n(16),
              a = n(19),
              c = n(33),
              n = n(34)
            ;(t.polling = function (e) {
              var t,
                n,
                o = !1,
                r = !1,
                i = !1 !== e.jsonp
              if (
                ('undefined' != typeof location &&
                  ((t = 'https:' === location.protocol),
                  (n = (n = location.port) || (t ? 443 : 80)),
                  (o = e.hostname !== location.hostname || n !== e.port),
                  (r = e.secure !== t)),
                (e.xdomain = o),
                (e.xscheme = r),
                'open' in new s(e) && !e.forceJSONP)
              )
                return new a(e)
              if (!i) throw new Error('JSONP disabled')
              return new c(e)
            }),
              (t.websocket = n)
          },
          function (e, t, n) {
            var o = n(17),
              r = n(18)
            e.exports = function (e) {
              var t = e.xdomain,
                n = e.xscheme,
                e = e.enablesXDR
              try {
                if ('undefined' != typeof XMLHttpRequest && (!t || o))
                  return new XMLHttpRequest()
              } catch (e) {}
              try {
                if ('undefined' != typeof XDomainRequest && !n && e)
                  return new XDomainRequest()
              } catch (e) {}
              if (!t)
                try {
                  return new r[['Active'].concat('Object').join('X')](
                    'Microsoft.XMLHTTP'
                  )
                } catch (e) {}
            }
          },
          function (t, e) {
            try {
              t.exports =
                'undefined' != typeof XMLHttpRequest &&
                'withCredentials' in new XMLHttpRequest()
            } catch (e) {
              t.exports = !1
            }
          },
          function (e, t) {
            e.exports =
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : Function('return this')()
          },
          function (e, t, n) {
            function o() {}
            function r(e) {
              var t, n
              c.call(this, e),
                (this.requestTimeout = e.requestTimeout),
                (this.extraHeaders = e.extraHeaders),
                'undefined' != typeof location &&
                  ((t = 'https:' === location.protocol),
                  (n = (n = location.port) || (t ? 443 : 80)),
                  (this.xd =
                    ('undefined' != typeof location &&
                      e.hostname !== location.hostname) ||
                    n !== e.port),
                  (this.xs = e.secure !== t))
            }
            function i(e) {
              ;(this.method = e.method || 'GET'),
                (this.uri = e.uri),
                (this.xd = !!e.xd),
                (this.xs = !!e.xs),
                (this.async = !1 !== e.async),
                (this.data = void 0 !== e.data ? e.data : null),
                (this.agent = e.agent),
                (this.isBinary = e.isBinary),
                (this.supportsBinary = e.supportsBinary),
                (this.enablesXDR = e.enablesXDR),
                (this.withCredentials = e.withCredentials),
                (this.requestTimeout = e.requestTimeout),
                (this.pfx = e.pfx),
                (this.key = e.key),
                (this.passphrase = e.passphrase),
                (this.cert = e.cert),
                (this.ca = e.ca),
                (this.ciphers = e.ciphers),
                (this.rejectUnauthorized = e.rejectUnauthorized),
                (this.extraHeaders = e.extraHeaders),
                this.create()
            }
            function s() {
              for (var e in i.requests)
                i.requests.hasOwnProperty(e) && i.requests[e].abort()
            }
            var a = n(16),
              c = n(20),
              p = n(8),
              u = n(31),
              h = n(3)('engine.io-client:polling-xhr'),
              n = n(18)
            ;(e.exports = r),
              (e.exports.Request = i),
              u(r, c),
              (r.prototype.supportsBinary = !0),
              (r.prototype.request = function (e) {
                return (
                  ((e = e || {}).uri = this.uri()),
                  (e.xd = this.xd),
                  (e.xs = this.xs),
                  (e.agent = this.agent || !1),
                  (e.supportsBinary = this.supportsBinary),
                  (e.enablesXDR = this.enablesXDR),
                  (e.withCredentials = this.withCredentials),
                  (e.pfx = this.pfx),
                  (e.key = this.key),
                  (e.passphrase = this.passphrase),
                  (e.cert = this.cert),
                  (e.ca = this.ca),
                  (e.ciphers = this.ciphers),
                  (e.rejectUnauthorized = this.rejectUnauthorized),
                  (e.requestTimeout = this.requestTimeout),
                  (e.extraHeaders = this.extraHeaders),
                  new i(e)
                )
              }),
              (r.prototype.doWrite = function (e, t) {
                var e = this.request({
                    method: 'POST',
                    data: e,
                    isBinary: 'string' != typeof e && void 0 !== e
                  }),
                  n = this
                e.on('success', t),
                  e.on('error', function (e) {
                    n.onError('xhr post error', e)
                  }),
                  (this.sendXhr = e)
              }),
              (r.prototype.doPoll = function () {
                h('xhr poll')
                var e = this.request(),
                  t = this
                e.on('data', function (e) {
                  t.onData(e)
                }),
                  e.on('error', function (e) {
                    t.onError('xhr poll error', e)
                  }),
                  (this.pollXhr = e)
              }),
              p(i.prototype),
              (i.prototype.create = function () {
                var e = {
                  agent: this.agent,
                  xdomain: this.xd,
                  xscheme: this.xs,
                  enablesXDR: this.enablesXDR
                }
                ;(e.pfx = this.pfx),
                  (e.key = this.key),
                  (e.passphrase = this.passphrase),
                  (e.cert = this.cert),
                  (e.ca = this.ca),
                  (e.ciphers = this.ciphers),
                  (e.rejectUnauthorized = this.rejectUnauthorized)
                var t = (this.xhr = new a(e)),
                  n = this
                try {
                  h('xhr open %s: %s', this.method, this.uri),
                    t.open(this.method, this.uri, this.async)
                  try {
                    if (this.extraHeaders)
                      for (var o in (t.setDisableHeaderCheck &&
                        t.setDisableHeaderCheck(!0),
                      this.extraHeaders))
                        this.extraHeaders.hasOwnProperty(o) &&
                          t.setRequestHeader(o, this.extraHeaders[o])
                  } catch (e) {}
                  if ('POST' === this.method)
                    try {
                      this.isBinary
                        ? t.setRequestHeader(
                            'Content-type',
                            'application/octet-stream'
                          )
                        : t.setRequestHeader(
                            'Content-type',
                            'text/plain;charset=UTF-8'
                          )
                    } catch (e) {}
                  try {
                    t.setRequestHeader('Accept', '*/*')
                  } catch (e) {}
                  'withCredentials' in t &&
                    (t.withCredentials = this.withCredentials),
                    this.requestTimeout && (t.timeout = this.requestTimeout),
                    this.hasXDR()
                      ? ((t.onload = function () {
                          n.onLoad()
                        }),
                        (t.onerror = function () {
                          n.onError(t.responseText)
                        }))
                      : (t.onreadystatechange = function () {
                          if (2 === t.readyState)
                            try {
                              var e = t.getResponseHeader('Content-Type')
                              ;((n.supportsBinary &&
                                'application/octet-stream' === e) ||
                                'application/octet-stream; charset=UTF-8' ===
                                  e) &&
                                (t.responseType = 'arraybuffer')
                            } catch (e) {}
                          4 === t.readyState &&
                            (200 === t.status || 1223 === t.status
                              ? n.onLoad()
                              : setTimeout(function () {
                                  n.onError(
                                    'number' == typeof t.status ? t.status : 0
                                  )
                                }, 0))
                        }),
                    h('xhr data %s', this.data),
                    t.send(this.data)
                } catch (e) {
                  return void setTimeout(function () {
                    n.onError(e)
                  }, 0)
                }
                'undefined' != typeof document &&
                  ((this.index = i.requestsCount++),
                  (i.requests[this.index] = this))
              }),
              (i.prototype.onSuccess = function () {
                this.emit('success'), this.cleanup()
              }),
              (i.prototype.onData = function (e) {
                this.emit('data', e), this.onSuccess()
              }),
              (i.prototype.onError = function (e) {
                this.emit('error', e), this.cleanup(!0)
              }),
              (i.prototype.cleanup = function (e) {
                if (void 0 !== this.xhr && null !== this.xhr) {
                  if (
                    (this.hasXDR()
                      ? (this.xhr.onload = this.xhr.onerror = o)
                      : (this.xhr.onreadystatechange = o),
                    e)
                  )
                    try {
                      this.xhr.abort()
                    } catch (e) {}
                  'undefined' != typeof document &&
                    delete i.requests[this.index],
                    (this.xhr = null)
                }
              }),
              (i.prototype.onLoad = function () {
                var e, t
                try {
                  try {
                    t = this.xhr.getResponseHeader('Content-Type')
                  } catch (e) {}
                  e =
                    (('application/octet-stream' === t ||
                      'application/octet-stream; charset=UTF-8' === t) &&
                      this.xhr.response) ||
                    this.xhr.responseText
                } catch (e) {
                  this.onError(e)
                }
                null != e && this.onData(e)
              }),
              (i.prototype.hasXDR = function () {
                return (
                  'undefined' != typeof XDomainRequest &&
                  !this.xs &&
                  this.enablesXDR
                )
              }),
              (i.prototype.abort = function () {
                this.cleanup()
              }),
              (i.requestsCount = 0),
              (i.requests = {}),
              'undefined' != typeof document &&
                ('function' == typeof attachEvent
                  ? attachEvent('onunload', s)
                  : 'function' == typeof addEventListener &&
                    ((n = 'onpagehide' in n ? 'pagehide' : 'unload'),
                    addEventListener(n, s, !1)))
          },
          function (e, t, n) {
            function o(e) {
              var t = e && e.forceBase64
              ;(u && !t) || (this.supportsBinary = !1), r.call(this, e)
            }
            var r = n(21),
              i = n(30),
              s = n(22),
              a = n(31),
              c = n(32),
              p = n(3)('engine.io-client:polling')
            e.exports = o
            var u = null != new (n(16))({ xdomain: !1 }).responseType
            a(o, r),
              (o.prototype.name = 'polling'),
              (o.prototype.doOpen = function () {
                this.poll()
              }),
              (o.prototype.pause = function (e) {
                function t() {
                  p('paused'), (o.readyState = 'paused'), e()
                }
                var n,
                  o = this
                ;(this.readyState = 'pausing'),
                  this.polling || !this.writable
                    ? ((n = 0),
                      this.polling &&
                        (p('we are currently polling - waiting to pause'),
                        n++,
                        this.once('pollComplete', function () {
                          p('pre-pause polling complete'), --n || t()
                        })),
                      this.writable ||
                        (p('we are currently writing - waiting to pause'),
                        n++,
                        this.once('drain', function () {
                          p('pre-pause writing complete'), --n || t()
                        })))
                    : t()
              }),
              (o.prototype.poll = function () {
                p('polling'),
                  (this.polling = !0),
                  this.doPoll(),
                  this.emit('poll')
              }),
              (o.prototype.onData = function (e) {
                var o = this
                p('polling got data %s', e)
                s.decodePayload(e, this.socket.binaryType, function (e, t, n) {
                  return (
                    'opening' === o.readyState &&
                      'open' === e.type &&
                      o.onOpen(),
                    'close' === e.type ? (o.onClose(), !1) : void o.onPacket(e)
                  )
                }),
                  'closed' !== this.readyState &&
                    ((this.polling = !1),
                    this.emit('pollComplete'),
                    'open' === this.readyState
                      ? this.poll()
                      : p(
                          'ignoring poll - transport state "%s"',
                          this.readyState
                        ))
              }),
              (o.prototype.doClose = function () {
                function e() {
                  p('writing close packet'), t.write([{ type: 'close' }])
                }
                var t = this
                'open' === this.readyState
                  ? (p('transport open - closing'), e())
                  : (p('transport not open - deferring close'),
                    this.once('open', e))
              }),
              (o.prototype.write = function (e) {
                var t = this
                this.writable = !1
                function n() {
                  ;(t.writable = !0), t.emit('drain')
                }
                s.encodePayload(e, this.supportsBinary, function (e) {
                  t.doWrite(e, n)
                })
              }),
              (o.prototype.uri = function () {
                var e = this.query || {},
                  t = this.secure ? 'https' : 'http',
                  n = ''
                return (
                  !1 !== this.timestampRequests &&
                    (e[this.timestampParam] = c()),
                  this.supportsBinary || e.sid || (e.b64 = 1),
                  (e = i.encode(e)),
                  this.port &&
                    (('https' == t && 443 !== Number(this.port)) ||
                      ('http' == t && 80 !== Number(this.port))) &&
                    (n = ':' + this.port),
                  e.length && (e = '?' + e),
                  t +
                    '://' +
                    (-1 !== this.hostname.indexOf(':')
                      ? '[' + this.hostname + ']'
                      : this.hostname) +
                    n +
                    this.path +
                    e
                )
              })
          },
          function (e, t, n) {
            function o(e) {
              ;(this.path = e.path),
                (this.hostname = e.hostname),
                (this.port = e.port),
                (this.secure = e.secure),
                (this.query = e.query),
                (this.timestampParam = e.timestampParam),
                (this.timestampRequests = e.timestampRequests),
                (this.readyState = ''),
                (this.agent = e.agent || !1),
                (this.socket = e.socket),
                (this.enablesXDR = e.enablesXDR),
                (this.withCredentials = e.withCredentials),
                (this.pfx = e.pfx),
                (this.key = e.key),
                (this.passphrase = e.passphrase),
                (this.cert = e.cert),
                (this.ca = e.ca),
                (this.ciphers = e.ciphers),
                (this.rejectUnauthorized = e.rejectUnauthorized),
                (this.forceNode = e.forceNode),
                (this.isReactNative = e.isReactNative),
                (this.extraHeaders = e.extraHeaders),
                (this.localAddress = e.localAddress)
            }
            var r = n(22)
            n(8)((e.exports = o).prototype),
              (o.prototype.onError = function (e, t) {
                e = new Error(e)
                return (
                  (e.type = 'TransportError'),
                  (e.description = t),
                  this.emit('error', e),
                  this
                )
              }),
              (o.prototype.open = function () {
                return (
                  ('closed' !== this.readyState && '' !== this.readyState) ||
                    ((this.readyState = 'opening'), this.doOpen()),
                  this
                )
              }),
              (o.prototype.close = function () {
                return (
                  ('opening' !== this.readyState &&
                    'open' !== this.readyState) ||
                    (this.doClose(), this.onClose()),
                  this
                )
              }),
              (o.prototype.send = function (e) {
                if ('open' !== this.readyState)
                  throw new Error('Transport not open')
                this.write(e)
              }),
              (o.prototype.onOpen = function () {
                ;(this.readyState = 'open'),
                  (this.writable = !0),
                  this.emit('open')
              }),
              (o.prototype.onData = function (e) {
                e = r.decodePacket(e, this.socket.binaryType)
                this.onPacket(e)
              }),
              (o.prototype.onPacket = function (e) {
                this.emit('packet', e)
              }),
              (o.prototype.onClose = function () {
                ;(this.readyState = 'closed'), this.emit('close')
              })
          },
          function (e, f, t) {
            function s(e, t, n) {
              if (!t) return f.encodeBase64Packet(e, n)
              if (h)
                return (function (e, t, n) {
                  if (!t) return f.encodeBase64Packet(e, n)
                  var o = new FileReader()
                  return (
                    (o.onload = function () {
                      f.encodePacket({ type: e.type, data: o.result }, t, !0, n)
                    }),
                    o.readAsArrayBuffer(e.data)
                  )
                })(e, t, n)
              t = new Uint8Array(1)
              return (t[0] = l[e.type]), n(new g([t.buffer, e.data]))
            }
            function i(e, t, n) {
              for (
                var r = new Array(e.length), o = c(e.length, n), i = 0;
                i < e.length;
                i++
              )
                !(function (n, e, o) {
                  t(e, function (e, t) {
                    ;(r[n] = t), o(e, r)
                  })
                })(i, e[i], o)
            }
            var o,
              n = t(23),
              a = t(24),
              d = t(25),
              c = t(26),
              p = t(27)
            'undefined' != typeof ArrayBuffer && (o = t(28))
            var r =
                'undefined' != typeof navigator &&
                /Android/i.test(navigator.userAgent),
              u =
                'undefined' != typeof navigator &&
                /PhantomJS/i.test(navigator.userAgent),
              h = r || u
            f.protocol = 3
            var l = (f.packets = {
                open: 0,
                close: 1,
                ping: 2,
                pong: 3,
                message: 4,
                upgrade: 5,
                noop: 6
              }),
              y = n(l),
              m = { type: 'error', data: 'parser error' },
              g = t(29)
            ;(f.encodePacket = function (e, t, n, o) {
              'function' == typeof t && ((o = t), (t = !1)),
                'function' == typeof n && ((o = n), (n = null))
              var r = void 0 === e.data ? void 0 : e.data.buffer || e.data
              if ('undefined' != typeof ArrayBuffer && r instanceof ArrayBuffer)
                return (function (e, t, n) {
                  if (!t) return f.encodeBase64Packet(e, n)
                  var t = e.data,
                    o = new Uint8Array(t),
                    r = new Uint8Array(1 + t.byteLength)
                  r[0] = l[e.type]
                  for (var i = 0; i < o.length; i++) r[i + 1] = o[i]
                  return n(r.buffer)
                })(e, t, o)
              if (void 0 !== g && r instanceof g) return s(e, t, o)
              if (r && r.base64)
                return (i = e), o('b' + f.packets[i.type] + i.data.data)
              var i = l[e.type]
              return (
                void 0 !== e.data &&
                  (i += n
                    ? p.encode(String(e.data), { strict: !1 })
                    : String(e.data)),
                o('' + i)
              )
            }),
              (f.encodeBase64Packet = function (t, n) {
                var o,
                  r = 'b' + f.packets[t.type]
                if (void 0 !== g && t.data instanceof g) {
                  var i = new FileReader()
                  return (
                    (i.onload = function () {
                      var e = i.result.split(',')[1]
                      n(r + e)
                    }),
                    i.readAsDataURL(t.data)
                  )
                }
                try {
                  o = String.fromCharCode.apply(null, new Uint8Array(t.data))
                } catch (e) {
                  for (
                    var s = new Uint8Array(t.data),
                      a = new Array(s.length),
                      c = 0;
                    c < s.length;
                    c++
                  )
                    a[c] = s[c]
                  o = String.fromCharCode.apply(null, a)
                }
                return (r += btoa(o)), n(r)
              }),
              (f.decodePacket = function (e, t, n) {
                if (void 0 === e) return m
                if ('string' == typeof e) {
                  if ('b' === e.charAt(0))
                    return f.decodeBase64Packet(e.substr(1), t)
                  if (
                    n &&
                    !1 ===
                      (e = (function (e) {
                        try {
                          e = p.decode(e, { strict: !1 })
                        } catch (e) {
                          return !1
                        }
                        return e
                      })(e))
                  )
                    return m
                  var o = e.charAt(0)
                  return Number(o) == o && y[o]
                    ? 1 < e.length
                      ? { type: y[o], data: e.substring(1) }
                      : { type: y[o] }
                    : m
                }
                ;(o = new Uint8Array(e)[0]), (e = d(e, 1))
                return (
                  g && 'blob' === t && (e = new g([e])), { type: y[o], data: e }
                )
              }),
              (f.decodeBase64Packet = function (e, t) {
                var n = y[e.charAt(0)]
                if (!o)
                  return { type: n, data: { base64: !0, data: e.substr(1) } }
                e = o.decode(e.substr(1))
                return {
                  type: n,
                  data: (e = 'blob' === t && g ? new g([e]) : e)
                }
              }),
              (f.encodePayload = function (e, n, o) {
                'function' == typeof n && ((o = n), (n = null))
                var r = a(e)
                return n && r
                  ? g && !h
                    ? f.encodePayloadAsBlob(e, o)
                    : f.encodePayloadAsArrayBuffer(e, o)
                  : e.length
                  ? void i(
                      e,
                      function (e, t) {
                        f.encodePacket(e, !!r && n, !1, function (e) {
                          t(null, (e = e).length + ':' + e)
                        })
                      },
                      function (e, t) {
                        return o(t.join(''))
                      }
                    )
                  : o('0:')
              }),
              (f.decodePayload = function (e, t, n) {
                if ('string' != typeof e)
                  return f.decodePayloadAsBinary(e, t, n)
                if (('function' == typeof t && ((n = t), (t = null)), '' === e))
                  return n(m, 0, 1)
                for (var o, r, i = '', s = 0, a = e.length; s < a; s++) {
                  var c = e.charAt(s)
                  if (':' === c) {
                    if ('' === i || i != (o = Number(i))) return n(m, 0, 1)
                    if (i != (r = e.substr(s + 1, o)).length) return n(m, 0, 1)
                    if (r.length) {
                      if (
                        ((r = f.decodePacket(r, t, !1)),
                        m.type === r.type && m.data === r.data)
                      )
                        return n(m, 0, 1)
                      if (!1 === n(r, s + o, a)) return
                    }
                    ;(s += o), (i = '')
                  } else i += c
                }
                return '' !== i ? n(m, 0, 1) : void 0
              }),
              (f.encodePayloadAsArrayBuffer = function (e, o) {
                return e.length
                  ? void i(
                      e,
                      function (e, t) {
                        f.encodePacket(e, !0, !0, function (e) {
                          return t(null, e)
                        })
                      },
                      function (e, t) {
                        var n = t.reduce(function (e, t) {
                            t = 'string' == typeof t ? t.length : t.byteLength
                            return e + t.toString().length + t + 2
                          }, 0),
                          s = new Uint8Array(n),
                          a = 0
                        return (
                          t.forEach(function (e) {
                            var t = 'string' == typeof e,
                              n = e
                            if (t) {
                              for (
                                var o = new Uint8Array(e.length), r = 0;
                                r < e.length;
                                r++
                              )
                                o[r] = e.charCodeAt(r)
                              n = o.buffer
                            }
                            s[a++] = t ? 0 : 1
                            for (
                              var i = n.byteLength.toString(), r = 0;
                              r < i.length;
                              r++
                            )
                              s[a++] = parseInt(i[r])
                            s[a++] = 255
                            for (
                              o = new Uint8Array(n), r = 0;
                              r < o.length;
                              r++
                            )
                              s[a++] = o[r]
                          }),
                          o(s.buffer)
                        )
                      }
                    )
                  : o(new ArrayBuffer(0))
              }),
              (f.encodePayloadAsBlob = function (e, n) {
                i(
                  e,
                  function (e, s) {
                    f.encodePacket(e, !0, !0, function (e) {
                      var t = new Uint8Array(1)
                      if (((t[0] = 1), 'string' == typeof e)) {
                        for (
                          var n = new Uint8Array(e.length), o = 0;
                          o < e.length;
                          o++
                        )
                          n[o] = e.charCodeAt(o)
                        ;(e = n.buffer), (t[0] = 0)
                      }
                      for (
                        var r = (
                            e instanceof ArrayBuffer ? e.byteLength : e.size
                          ).toString(),
                          i = new Uint8Array(r.length + 1),
                          o = 0;
                        o < r.length;
                        o++
                      )
                        i[o] = parseInt(r[o])
                      ;(i[r.length] = 255),
                        g && ((t = new g([t.buffer, i.buffer, e])), s(null, t))
                    })
                  },
                  function (e, t) {
                    return n(new g(t))
                  }
                )
              }),
              (f.decodePayloadAsBinary = function (e, n, o) {
                'function' == typeof n && ((o = n), (n = null))
                for (var t = e, r = []; 0 < t.byteLength; ) {
                  for (
                    var i = new Uint8Array(t), s = 0 === i[0], a = '', c = 1;
                    255 !== i[c];
                    c++
                  ) {
                    if (310 < a.length) return o(m, 0, 1)
                    a += i[c]
                  }
                  var t = d(t, 2 + a.length),
                    a = parseInt(a),
                    p = d(t, 0, a)
                  if (s)
                    try {
                      p = String.fromCharCode.apply(null, new Uint8Array(p))
                    } catch (e) {
                      for (
                        var u = new Uint8Array(p), p = '', c = 0;
                        c < u.length;
                        c++
                      )
                        p += String.fromCharCode(u[c])
                    }
                  r.push(p), (t = d(t, a))
                }
                var h = r.length
                r.forEach(function (e, t) {
                  o(f.decodePacket(e, n, !0), t, h)
                })
              })
          },
          function (e, t) {
            e.exports =
              Object.keys ||
              function (e) {
                var t,
                  n = [],
                  o = Object.prototype.hasOwnProperty
                for (t in e) o.call(e, t) && n.push(t)
                return n
              }
          },
          function (e, t, n) {
            var i = n(10),
              n = Object.prototype.toString,
              s =
                'function' == typeof Blob ||
                ('undefined' != typeof Blob &&
                  '[object BlobConstructor]' === n.call(Blob)),
              a =
                'function' == typeof File ||
                ('undefined' != typeof File &&
                  '[object FileConstructor]' === n.call(File))
            e.exports = function e(t) {
              if (!t || 'object' != typeof t) return !1
              if (i(t)) {
                for (var n = 0, o = t.length; n < o; n++) if (e(t[n])) return !0
                return !1
              }
              if (
                ('function' == typeof Buffer &&
                  Buffer.isBuffer &&
                  Buffer.isBuffer(t)) ||
                ('function' == typeof ArrayBuffer &&
                  t instanceof ArrayBuffer) ||
                (s && t instanceof Blob) ||
                (a && t instanceof File)
              )
                return !0
              if (
                t.toJSON &&
                'function' == typeof t.toJSON &&
                1 === arguments.length
              )
                return e(t.toJSON(), !0)
              for (var r in t)
                if (Object.prototype.hasOwnProperty.call(t, r) && e(t[r]))
                  return !0
              return !1
            }
          },
          function (e, t) {
            e.exports = function (e, t, n) {
              var o = e.byteLength
              if (((t = t || 0), (n = n || o), e.slice)) return e.slice(t, n)
              if (
                (t < 0 && (t += o),
                n < 0 && (n += o),
                o < n && (n = o),
                o <= t || n <= t || 0 === o)
              )
                return new ArrayBuffer(0)
              for (
                var r = new Uint8Array(e),
                  i = new Uint8Array(n - t),
                  s = t,
                  a = 0;
                s < n;
                s++, a++
              )
                i[a] = r[s]
              return i.buffer
            }
          },
          function (e, t) {
            function s() {}
            e.exports = function (e, n, o) {
              function r(e, t) {
                if (r.count <= 0) throw new Error('after called too many times')
                --r.count,
                  e
                    ? ((i = !0), n(e), (n = o))
                    : 0 !== r.count || i || n(null, t)
              }
              var i = !1
              return (o = o || s), 0 === (r.count = e) ? n() : r
            }
          },
          function (e, t) {
            function a(e) {
              for (var t, n, o = [], r = 0, i = e.length; r < i; )
                55296 <= (t = e.charCodeAt(r++)) && t <= 56319 && r < i
                  ? 56320 == (64512 & (n = e.charCodeAt(r++)))
                    ? o.push(((1023 & t) << 10) + (1023 & n) + 65536)
                    : (o.push(t), r--)
                  : o.push(t)
              return o
            }
            function c(e, t) {
              if (!(55296 <= e && e <= 57343)) return 1
              if (t)
                throw Error(
                  'Lone surrogate U+' +
                    e.toString(16).toUpperCase() +
                    ' is not a scalar value'
                )
            }
            function p(e, t) {
              return f(((e >> t) & 63) | 128)
            }
            function i() {
              if (u <= h) throw Error('Invalid byte index')
              var e = 255 & s[h]
              if ((h++, 128 == (192 & e))) return 63 & e
              throw Error('Invalid continuation byte')
            }
            var s,
              u,
              h,
              f = String.fromCharCode
            e.exports = {
              version: '2.1.2',
              encode: function (e, t) {
                for (
                  var n = !1 !== (t = t || {}).strict,
                    o = a(e),
                    r = o.length,
                    i = -1,
                    s = '';
                  ++i < r;

                )
                  s += (function (e, t) {
                    if (0 == (4294967168 & e)) return f(e)
                    var n = ''
                    return (
                      0 == (4294965248 & e)
                        ? (n = f(((e >> 6) & 31) | 192))
                        : 0 == (4294901760 & e)
                        ? (c(e, t) || (e = 65533),
                          (n = f(((e >> 12) & 15) | 224)),
                          (n += p(e, 6)))
                        : 0 == (4292870144 & e) &&
                          ((n = f(((e >> 18) & 7) | 240)),
                          (n += p(e, 12)),
                          (n += p(e, 6))),
                      n + f((63 & e) | 128)
                    )
                  })(o[i], n)
                return s
              },
              decode: function (e, t) {
                var n = !1 !== (t = t || {}).strict
                ;(s = a(e)), (u = s.length), (h = 0)
                for (
                  var o, r = [];
                  !1 !==
                  (o = (function (e) {
                    var t, n
                    if (u < h) throw Error('Invalid byte index')
                    if (h == u) return !1
                    if (((t = 255 & s[h]), h++, 0 == (128 & t))) return t
                    if (192 == (224 & t)) {
                      if (128 <= (n = ((31 & t) << 6) | i())) return n
                      throw Error('Invalid continuation byte')
                    }
                    if (224 == (240 & t)) {
                      if (2048 <= (n = ((15 & t) << 12) | (i() << 6) | i()))
                        return c(n, e) ? n : 65533
                      throw Error('Invalid continuation byte')
                    }
                    if (
                      240 == (248 & t) &&
                      65536 <=
                        (n =
                          ((7 & t) << 18) | (i() << 12) | (i() << 6) | i()) &&
                      n <= 1114111
                    )
                      return n
                    throw Error('Invalid UTF-8 detected')
                  })(n));

                )
                  r.push(o)
                return (function (e) {
                  for (var t, n = e.length, o = -1, r = ''; ++o < n; )
                    65535 < (t = e[o]) &&
                      ((r += f((((t -= 65536) >>> 10) & 1023) | 55296)),
                      (t = 56320 | (1023 & t))),
                      (r += f(t))
                  return r
                })(r)
              }
            }
          },
          function (e, t) {
            !(function (u) {
              'use strict'
              ;(t.encode = function (e) {
                for (
                  var t = new Uint8Array(e), n = t.length, o = '', r = 0;
                  r < n;
                  r += 3
                )
                  (o += u[t[r] >> 2]),
                    (o += u[((3 & t[r]) << 4) | (t[r + 1] >> 4)]),
                    (o += u[((15 & t[r + 1]) << 2) | (t[r + 2] >> 6)]),
                    (o += u[63 & t[r + 2]])
                return (
                  n % 3 == 2
                    ? (o = o.substring(0, o.length - 1) + '=')
                    : n % 3 == 1 && (o = o.substring(0, o.length - 2) + '=='),
                  o
                )
              }),
                (t.decode = function (e) {
                  var t,
                    n,
                    o,
                    r,
                    i = 0.75 * e.length,
                    s = e.length,
                    a = 0
                  '=' === e[e.length - 1] &&
                    (i--, '=' === e[e.length - 2] && i--)
                  for (
                    var i = new ArrayBuffer(i), c = new Uint8Array(i), p = 0;
                    p < s;
                    p += 4
                  )
                    (t = u.indexOf(e[p])),
                      (n = u.indexOf(e[p + 1])),
                      (o = u.indexOf(e[p + 2])),
                      (r = u.indexOf(e[p + 3])),
                      (c[a++] = (t << 2) | (n >> 4)),
                      (c[a++] = ((15 & n) << 4) | (o >> 2)),
                      (c[a++] = ((3 & o) << 6) | (63 & r))
                  return i
                })
            })(
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
            )
          },
          function (e, t) {
            function o(e) {
              return e.map(function (e) {
                if (e.buffer instanceof ArrayBuffer) {
                  var t,
                    n = e.buffer
                  return (
                    e.byteLength !== n.byteLength &&
                      ((t = new Uint8Array(e.byteLength)).set(
                        new Uint8Array(n, e.byteOffset, e.byteLength)
                      ),
                      (n = t.buffer)),
                    n
                  )
                }
                return e
              })
            }
            function n(e, t) {
              t = t || {}
              var n = new i()
              return (
                o(e).forEach(function (e) {
                  n.append(e)
                }),
                t.type ? n.getBlob(t.type) : n.getBlob()
              )
            }
            function r(e, t) {
              return new Blob(o(e), t || {})
            }
            var i =
                void 0 !== i
                  ? i
                  : 'undefined' != typeof WebKitBlobBuilder
                  ? WebKitBlobBuilder
                  : 'undefined' != typeof MSBlobBuilder
                  ? MSBlobBuilder
                  : 'undefined' != typeof MozBlobBuilder && MozBlobBuilder,
              s = (function () {
                try {
                  return 2 === new Blob(['hi']).size
                } catch (e) {
                  return !1
                }
              })(),
              a =
                s &&
                (function () {
                  try {
                    return 2 === new Blob([new Uint8Array([1, 2])]).size
                  } catch (e) {
                    return !1
                  }
                })(),
              c = i && i.prototype.append && i.prototype.getBlob
            'undefined' != typeof Blob &&
              ((n.prototype = Blob.prototype), (r.prototype = Blob.prototype)),
              (e.exports = s ? (a ? Blob : r) : c ? n : void 0)
          },
          function (e, t) {
            ;(t.encode = function (e) {
              var t,
                n = ''
              for (t in e)
                e.hasOwnProperty(t) &&
                  (n.length && (n += '&'),
                  (n += encodeURIComponent(t) + '=' + encodeURIComponent(e[t])))
              return n
            }),
              (t.decode = function (e) {
                for (
                  var t = {}, n = e.split('&'), o = 0, r = n.length;
                  o < r;
                  o++
                ) {
                  var i = n[o].split('=')
                  t[decodeURIComponent(i[0])] = decodeURIComponent(i[1])
                }
                return t
              })
          },
          function (e, t) {
            e.exports = function (e, t) {
              function n() {}
              ;(n.prototype = t.prototype),
                (e.prototype = new n()),
                (e.prototype.constructor = e)
            }
          },
          function (e, t) {
            'use strict'
            function n(e) {
              for (
                var t = '';
                (t = i[e % s] + t), (e = Math.floor(e / s)), 0 < e;

              );
              return t
            }
            function o() {
              var e = n(+new Date())
              return e !== r ? ((c = 0), (r = e)) : e + '.' + n(c++)
            }
            for (
              var r,
                i =
                  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(
                    ''
                  ),
                s = 64,
                a = {},
                c = 0,
                p = 0;
              p < s;
              p++
            )
              a[i[p]] = p
            ;(o.encode = n),
              (o.decode = function (e) {
                var t = 0
                for (p = 0; p < e.length; p++) t = t * s + a[e.charAt(p)]
                return t
              }),
              (e.exports = o)
          },
          function (e, t, n) {
            function o() {}
            function r(e) {
              i.call(this, e),
                (this.query = this.query || {}),
                (c = c || (a.___eio = a.___eio || [])),
                (this.index = c.length)
              var t = this
              c.push(function (e) {
                t.onData(e)
              }),
                (this.query.j = this.index),
                'function' == typeof addEventListener &&
                  addEventListener(
                    'beforeunload',
                    function () {
                      t.script && (t.script.onerror = o)
                    },
                    !1
                  )
            }
            var i = n(20),
              s = n(31),
              a = n(18)
            e.exports = r
            var c,
              p = /\n/g,
              u = /\\n/g
            s(r, i),
              (r.prototype.supportsBinary = !1),
              (r.prototype.doClose = function () {
                this.script &&
                  (this.script.parentNode.removeChild(this.script),
                  (this.script = null)),
                  this.form &&
                    (this.form.parentNode.removeChild(this.form),
                    (this.form = null),
                    (this.iframe = null)),
                  i.prototype.doClose.call(this)
              }),
              (r.prototype.doPoll = function () {
                var t = this,
                  e = document.createElement('script')
                this.script &&
                  (this.script.parentNode.removeChild(this.script),
                  (this.script = null)),
                  (e.async = !0),
                  (e.src = this.uri()),
                  (e.onerror = function (e) {
                    t.onError('jsonp poll error', e)
                  })
                var n = document.getElementsByTagName('script')[0]
                n
                  ? n.parentNode.insertBefore(e, n)
                  : (document.head || document.body).appendChild(e),
                  (this.script = e),
                  'undefined' != typeof navigator &&
                    /gecko/i.test(navigator.userAgent) &&
                    setTimeout(function () {
                      var e = document.createElement('iframe')
                      document.body.appendChild(e), document.body.removeChild(e)
                    }, 100)
              }),
              (r.prototype.doWrite = function (e, t) {
                function n() {
                  o(), t()
                }
                function o() {
                  if (c.iframe)
                    try {
                      c.form.removeChild(c.iframe)
                    } catch (e) {
                      c.onError('jsonp polling iframe removal error', e)
                    }
                  try {
                    var e =
                      '<iframe src="javascript:0" name="' + c.iframeId + '">'
                    r = document.createElement(e)
                  } catch (e) {
                    ;((r = document.createElement('iframe')).name = c.iframeId),
                      (r.src = 'javascript:0')
                  }
                  ;(r.id = c.iframeId), c.form.appendChild(r), (c.iframe = r)
                }
                var r,
                  i,
                  s,
                  a,
                  c = this
                this.form ||
                  ((i = document.createElement('form')),
                  (s = document.createElement('textarea')),
                  (a = this.iframeId = 'eio_iframe_' + this.index),
                  (i.className = 'socketio'),
                  (i.style.position = 'absolute'),
                  (i.style.top = '-1000px'),
                  (i.style.left = '-1000px'),
                  (i.target = a),
                  (i.method = 'POST'),
                  i.setAttribute('accept-charset', 'utf-8'),
                  (s.name = 'd'),
                  i.appendChild(s),
                  document.body.appendChild(i),
                  (this.form = i),
                  (this.area = s)),
                  (this.form.action = this.uri()),
                  o(),
                  (e = e.replace(u, '\\\n')),
                  (this.area.value = e.replace(p, '\\n'))
                try {
                  this.form.submit()
                } catch (e) {}
                this.iframe.attachEvent
                  ? (this.iframe.onreadystatechange = function () {
                      'complete' === c.iframe.readyState && n()
                    })
                  : (this.iframe.onload = n)
              })
          },
          function (e, t, n) {
            function o(e) {
              e && e.forceBase64 && (this.supportsBinary = !1),
                (this.perMessageDeflate = e.perMessageDeflate),
                (this.usingBrowserWebSocket = r && !e.forceNode),
                (this.protocols = e.protocols),
                this.usingBrowserWebSocket || (f = i),
                s.call(this, e)
            }
            var r,
              i,
              s = n(21),
              a = n(22),
              c = n(30),
              p = n(31),
              u = n(32),
              h = n(3)('engine.io-client:websocket')
            if (
              ('undefined' != typeof WebSocket
                ? (r = WebSocket)
                : 'undefined' != typeof self &&
                  (r = self.WebSocket || self.MozWebSocket),
              'undefined' == typeof window)
            )
              try {
                i = n(35)
              } catch (e) {}
            var f = r || i
            p((e.exports = o), s),
              (o.prototype.name = 'websocket'),
              (o.prototype.supportsBinary = !0),
              (o.prototype.doOpen = function () {
                if (this.check()) {
                  var e = this.uri(),
                    t = this.protocols,
                    n = {}
                  this.isReactNative ||
                    ((n.agent = this.agent),
                    (n.perMessageDeflate = this.perMessageDeflate),
                    (n.pfx = this.pfx),
                    (n.key = this.key),
                    (n.passphrase = this.passphrase),
                    (n.cert = this.cert),
                    (n.ca = this.ca),
                    (n.ciphers = this.ciphers),
                    (n.rejectUnauthorized = this.rejectUnauthorized)),
                    this.extraHeaders && (n.headers = this.extraHeaders),
                    this.localAddress && (n.localAddress = this.localAddress)
                  try {
                    this.ws =
                      this.usingBrowserWebSocket && !this.isReactNative
                        ? t
                          ? new f(e, t)
                          : new f(e)
                        : new f(e, t, n)
                  } catch (e) {
                    return this.emit('error', e)
                  }
                  void 0 === this.ws.binaryType && (this.supportsBinary = !1),
                    this.ws.supports && this.ws.supports.binary
                      ? ((this.supportsBinary = !0),
                        (this.ws.binaryType = 'nodebuffer'))
                      : (this.ws.binaryType = 'arraybuffer'),
                    this.addEventListeners()
                }
              }),
              (o.prototype.addEventListeners = function () {
                var t = this
                ;(this.ws.onopen = function () {
                  t.onOpen()
                }),
                  (this.ws.onclose = function () {
                    t.onClose()
                  }),
                  (this.ws.onmessage = function (e) {
                    t.onData(e.data)
                  }),
                  (this.ws.onerror = function (e) {
                    t.onError('websocket error', e)
                  })
              }),
              (o.prototype.write = function (e) {
                var o = this
                this.writable = !1
                for (var r = e.length, t = 0, n = r; t < n; t++)
                  !(function (n) {
                    a.encodePacket(n, o.supportsBinary, function (e) {
                      var t
                      o.usingBrowserWebSocket ||
                        ((t = {}),
                        n.options && (t.compress = n.options.compress),
                        !o.perMessageDeflate ||
                          (('string' == typeof e
                            ? Buffer.byteLength(e)
                            : e.length) < o.perMessageDeflate.threshold &&
                            (t.compress = !1)))
                      try {
                        o.usingBrowserWebSocket ? o.ws.send(e) : o.ws.send(e, t)
                      } catch (e) {
                        h('websocket closed before onclose event')
                      }
                      --r ||
                        (o.emit('flush'),
                        setTimeout(function () {
                          ;(o.writable = !0), o.emit('drain')
                        }, 0))
                    })
                  })(e[t])
              }),
              (o.prototype.onClose = function () {
                s.prototype.onClose.call(this)
              }),
              (o.prototype.doClose = function () {
                void 0 !== this.ws && this.ws.close()
              }),
              (o.prototype.uri = function () {
                var e = this.query || {},
                  t = this.secure ? 'wss' : 'ws',
                  n = ''
                return (
                  this.port &&
                    (('wss' == t && 443 !== Number(this.port)) ||
                      ('ws' == t && 80 !== Number(this.port))) &&
                    (n = ':' + this.port),
                  this.timestampRequests && (e[this.timestampParam] = u()),
                  this.supportsBinary || (e.b64 = 1),
                  (e = c.encode(e)).length && (e = '?' + e),
                  t +
                    '://' +
                    (-1 !== this.hostname.indexOf(':')
                      ? '[' + this.hostname + ']'
                      : this.hostname) +
                    n +
                    this.path +
                    e
                )
              }),
              (o.prototype.check = function () {
                return !(
                  !f ||
                  ('__initialize' in f && this.name === o.prototype.name)
                )
              })
          },
          function (e, t) {},
          function (e, t) {
            var o = [].indexOf
            e.exports = function (e, t) {
              if (o) return e.indexOf(t)
              for (var n = 0; n < e.length; ++n) if (e[n] === t) return n
              return -1
            }
          },
          function (e, t, n) {
            function o(e, t, n) {
              ;(this.io = e),
                (this.nsp = t),
                ((this.json = this).ids = 0),
                (this.acks = {}),
                (this.receiveBuffer = []),
                (this.sendBuffer = []),
                (this.connected = !1),
                (this.disconnected = !0),
                (this.flags = {}),
                n && n.query && (this.query = n.query),
                this.io.autoConnect && this.open()
            }
            var r = n(7),
              i = n(8),
              s = n(38),
              a = n(39),
              c = n(40),
              p = n(3)('socket.io-client:socket'),
              u = n(30),
              h = n(24)
            e.exports = o
            var f = {
                connect: 1,
                connect_error: 1,
                connect_timeout: 1,
                connecting: 1,
                disconnect: 1,
                error: 1,
                reconnect: 1,
                reconnect_attempt: 1,
                reconnect_failed: 1,
                reconnect_error: 1,
                reconnecting: 1,
                ping: 1,
                pong: 1
              },
              d = i.prototype.emit
            i(o.prototype),
              (o.prototype.subEvents = function () {
                var e
                this.subs ||
                  ((e = this.io),
                  (this.subs = [
                    a(e, 'open', c(this, 'onopen')),
                    a(e, 'packet', c(this, 'onpacket')),
                    a(e, 'close', c(this, 'onclose'))
                  ]))
              }),
              (o.prototype.open = o.prototype.connect =
                function () {
                  return (
                    this.connected ||
                      (this.subEvents(),
                      this.io.reconnecting || this.io.open(),
                      'open' === this.io.readyState && this.onopen(),
                      this.emit('connecting')),
                    this
                  )
                }),
              (o.prototype.send = function () {
                var e = s(arguments)
                return e.unshift('message'), this.emit.apply(this, e), this
              }),
              (o.prototype.emit = function (e) {
                if (f.hasOwnProperty(e)) return d.apply(this, arguments), this
                var t = s(arguments),
                  n = {
                    type: (
                      void 0 !== this.flags.binary ? this.flags.binary : h(t)
                    )
                      ? r.BINARY_EVENT
                      : r.EVENT,
                    data: t,
                    options: {}
                  }
                return (
                  (n.options.compress =
                    !this.flags || !1 !== this.flags.compress),
                  'function' == typeof t[t.length - 1] &&
                    (p('emitting packet with ack id %d', this.ids),
                    (this.acks[this.ids] = t.pop()),
                    (n.id = this.ids++)),
                  this.connected ? this.packet(n) : this.sendBuffer.push(n),
                  (this.flags = {}),
                  this
                )
              }),
              (o.prototype.packet = function (e) {
                ;(e.nsp = this.nsp), this.io.packet(e)
              }),
              (o.prototype.onopen = function () {
                var e
                p('transport is open - connecting'),
                  '/' !== this.nsp &&
                    (this.query
                      ? ((e =
                          'object' == typeof this.query
                            ? u.encode(this.query)
                            : this.query),
                        p('sending connect packet with query %s', e),
                        this.packet({ type: r.CONNECT, query: e }))
                      : this.packet({ type: r.CONNECT }))
              }),
              (o.prototype.onclose = function (e) {
                p('close (%s)', e),
                  (this.connected = !1),
                  (this.disconnected = !0),
                  delete this.id,
                  this.emit('disconnect', e)
              }),
              (o.prototype.onpacket = function (e) {
                var t = e.nsp === this.nsp,
                  n = e.type === r.ERROR && '/' === e.nsp
                if (t || n)
                  switch (e.type) {
                    case r.CONNECT:
                      this.onconnect()
                      break
                    case r.EVENT:
                    case r.BINARY_EVENT:
                      this.onevent(e)
                      break
                    case r.ACK:
                    case r.BINARY_ACK:
                      this.onack(e)
                      break
                    case r.DISCONNECT:
                      this.ondisconnect()
                      break
                    case r.ERROR:
                      this.emit('error', e.data)
                  }
              }),
              (o.prototype.onevent = function (e) {
                var t = e.data || []
                p('emitting event %j', t),
                  null != e.id &&
                    (p('attaching ack callback to event'),
                    t.push(this.ack(e.id))),
                  this.connected ? d.apply(this, t) : this.receiveBuffer.push(t)
              }),
              (o.prototype.ack = function (t) {
                var n = this,
                  o = !1
                return function () {
                  var e
                  o ||
                    ((o = !0),
                    (e = s(arguments)),
                    p('sending ack %j', e),
                    n.packet({
                      type: h(e) ? r.BINARY_ACK : r.ACK,
                      id: t,
                      data: e
                    }))
                }
              }),
              (o.prototype.onack = function (e) {
                var t = this.acks[e.id]
                'function' == typeof t
                  ? (p('calling ack %s with %j', e.id, e.data),
                    t.apply(this, e.data),
                    delete this.acks[e.id])
                  : p('bad ack %s', e.id)
              }),
              (o.prototype.onconnect = function () {
                ;(this.connected = !0),
                  (this.disconnected = !1),
                  this.emit('connect'),
                  this.emitBuffered()
              }),
              (o.prototype.emitBuffered = function () {
                for (var e = 0; e < this.receiveBuffer.length; e++)
                  d.apply(this, this.receiveBuffer[e])
                for (
                  this.receiveBuffer = [], e = 0;
                  e < this.sendBuffer.length;
                  e++
                )
                  this.packet(this.sendBuffer[e])
                this.sendBuffer = []
              }),
              (o.prototype.ondisconnect = function () {
                p('server disconnect (%s)', this.nsp),
                  this.destroy(),
                  this.onclose('io server disconnect')
              }),
              (o.prototype.destroy = function () {
                if (this.subs) {
                  for (var e = 0; e < this.subs.length; e++)
                    this.subs[e].destroy()
                  this.subs = null
                }
                this.io.destroy(this)
              }),
              (o.prototype.close = o.prototype.disconnect =
                function () {
                  return (
                    this.connected &&
                      (p('performing disconnect (%s)', this.nsp),
                      this.packet({ type: r.DISCONNECT })),
                    this.destroy(),
                    this.connected && this.onclose('io client disconnect'),
                    this
                  )
                }),
              (o.prototype.compress = function (e) {
                return (this.flags.compress = e), this
              }),
              (o.prototype.binary = function (e) {
                return (this.flags.binary = e), this
              })
          },
          function (e, t) {
            e.exports = function (e, t) {
              for (var n = [], o = (t = t || 0) || 0; o < e.length; o++)
                n[o - t] = e[o]
              return n
            }
          },
          function (e, t) {
            e.exports = function (e, t, n) {
              return (
                e.on(t, n),
                {
                  destroy: function () {
                    e.removeListener(t, n)
                  }
                }
              )
            }
          },
          function (e, t) {
            var o = [].slice
            e.exports = function (e, t) {
              if ('function' != typeof (t = 'string' == typeof t ? e[t] : t))
                throw new Error('bind() requires a function')
              var n = o.call(arguments, 2)
              return function () {
                return t.apply(e, n.concat(o.call(arguments)))
              }
            }
          },
          function (e, t) {
            function n(e) {
              ;(this.ms = (e = e || {}).min || 100),
                (this.max = e.max || 1e4),
                (this.factor = e.factor || 2),
                (this.jitter = 0 < e.jitter && e.jitter <= 1 ? e.jitter : 0),
                (this.attempts = 0)
            }
            ;((e.exports = n).prototype.duration = function () {
              var e,
                t,
                n = this.ms * Math.pow(this.factor, this.attempts++)
              return (
                this.jitter &&
                  ((e = Math.random()),
                  (t = Math.floor(e * this.jitter * n)),
                  (n = 0 == (1 & Math.floor(10 * e)) ? n - t : n + t)),
                0 | Math.min(n, this.max)
              )
            }),
              (n.prototype.reset = function () {
                this.attempts = 0
              }),
              (n.prototype.setMin = function (e) {
                this.ms = e
              }),
              (n.prototype.setMax = function (e) {
                this.max = e
              }),
              (n.prototype.setJitter = function (e) {
                this.jitter = e
              })
          }
        ]),
      (n.c = r),
      (n.p = ''),
      n(0)
    )
    function n(e) {
      if (r[e]) return r[e].exports
      var t = (r[e] = { exports: {}, id: e, loaded: !1 })
      return o[e].call(t.exports, t, t.exports, n), (t.loaded = !0), t.exports
    }
    var o, r
  })
