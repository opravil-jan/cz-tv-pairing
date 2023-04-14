/*
 * @App: Remote library
 * @Author: SVSys s.r.o.
 * @Build: Tue, 11 Dec 2018 13:25:24 GMT
 * @Synced: 17.06.2019
 */
function Remote(e, t) {
  var n = this
  ;(this.enable = e && 'undefined' != typeof io && !!_CONFRemoteService),
    (this.createUniquePairedDeviceName = _CONFRemoteService
      ? _CONFRemoteService.createUniquePairedDeviceName
      : !0),
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
        (this.socketioPath = _CONFRemoteService.APIPath))
      : ((this.socketioHost = ''), (this.socketioPath = '')),
    (this.connected = !1)
  var o = this.getPairCodeFromUrlParams()
  o ? this.pairDevice(o) : this.connect(),
    (document.onunload = function () {
      n.disconnect()
    })
}
var _CONFRemoteService = {
  APIHost: 'https://rcct.ceskatelevize.cz',
  APIPath: '/remoteapi/v0/io',
  createUniquePairedDeviceName: !0,
  version: '0.2',
  description: 'WEB Remote API service'
}
;(Remote.prototype._debugLogTransport = function () {
  'undefined' != typeof _debug &&
    _debug.logTime('Transport method: ' + this.socket.io.engine.transport.name)
}),
  (Remote.prototype.getPairCodeFromUrlParams = function () {
    var e = {}
    window.location.search.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function (t, n, o) {
        e[n] = o
      }
    )
    try {
      if (e.paircode) return e.paircode
    } catch (t) {}
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
    var o = n.toGMTString()
    ;(t = escape(t)),
      (document.cookie = e + '=' + t + ';expires=' + o + '; path=/')
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
    return '' != e && null == this.id
      ? ((this.id = e), 1 == t && this.setKeyValueToCookies('deviceid', e), !0)
      : !1
  }),
  (Remote.prototype.restoreAllValuesFromCookies = function () {
    var e = this.getKeyValueFromCookies('devicename')
    ;(this.deviceName = null == e ? this.deviceTypeName : e),
      (this.id = this.getKeyValueFromCookies('deviceid')),
      '' == this.id && (this.id = null)
    var t = this.getKeyValueFromCookies('devicepaired')
    ;(this.paired = null == t || '' == t ? {} : JSON.parse(t)),
      (this.pairedOnline = {}),
      (this.NoOfPairedOnline = 0)
  }),
  (Remote.prototype.saveAllValuesToCookies = function () {
    return null != this.id
      ? (this.setKeyValueToCookies('devicename', this.deviceName),
        this.setKeyValueToCookies('deviceid', this.id),
        this.setKeyValueToCookies('devicepaired', JSON.stringify(this.paired)),
        !0)
      : !1
  }),
  (Remote.prototype.updatePairedDevice = function (e, t, n) {
    if ('online' == n) {
      if ('undefined' == typeof this.paired[e]) {
        var o = 0
        if (this.createUniquePairedDeviceName)
          for (var r = 0; 1e3 > r; r++) {
            var i = !0
            for (var s in this.paired)
              if (this.paired.hasOwnProperty(s)) {
                var a = t + (r ? '' + r : '')
                if (this.paired[s] == a) {
                  i = !1
                  break
                }
              }
            if (i) {
              o = r
              break
            }
          }
        this.paired[e] = t + (o ? '' + o : '')
      }
      this.saveAllValuesToCookies(), (this.pairedOnline[e] = this.paired[e])
    } else
      'undefined' != typeof this.pairedOnline[e] && delete this.pairedOnline[e],
        'removed' == n &&
          'undefined' != typeof this.paired[e] &&
          (delete this.paired[e], this.saveAllValuesToCookies())
    var c = 0
    for (var r in this.pairedOnline) this.pairedOnline.hasOwnProperty(r) && c++
    this.NoOfPairedOnline = c
  }),
  (Remote.prototype.hasPairedOnline = function () {
    return this.NoOfPairedOnline > 0
  }),
  (Remote.prototype.getPairedOnline = function () {
    return this.pairedOnline
  }),
  (Remote.prototype.getAllPaired = function () {
    var e = {}
    for (var t in this.paired)
      e[t] = {
        name: this.paired[t],
        state: this.pairedOnline[t] ? 'online' : 'offline'
      }
    return e
  }),
  (Remote.prototype.setPairedDeviceName = function (e, t) {
    'undefined' != typeof this.paired[e] &&
      ((this.paired[e] = t), this.saveAllValuesToCookies())
  }),
  (Remote.prototype.init = function () {
    if (this.enable && !this.isInit) {
      var e = this
      this.socket.on('connect', function () {
        ;(e.connected = !0),
          'undefined' != typeof _debug && _debug.logTime('Connected'),
          null != e.onConnected && e.onConnected(),
          e.sendPairedDevices()
      }),
        this.socket.on('connect_error', function (t) {
          null != e.onConnectError && e.onConnectError(t)
        }),
        this.socket.on('error', function (t) {
          null != e.onError && e.onError(t)
        }),
        this.socket.on('newid', function (t) {
          ;(e.id = t),
            'undefined' != typeof _debug && _debug.logTime('Get new ID: ' + t)
        }),
        this.socket.on('pairdeviceresult', function (t) {
          'undefined' != typeof _debug &&
            _debug.logTime('Pair device result: ' + JSON.stringify(t)),
            'ok' == t.result &&
              e.updatePairedDevice(
                t.paireddevice.id,
                t.paireddevice.type,
                t.paireddevice.state
              ),
            null != e.onPairDeviceResult && e.onPairDeviceResult(t)
        }),
        this.socket.on('newpairingid', function (t) {
          'undefined' != typeof _debug &&
            _debug.logTime('New pairing ID: ' + t),
            null != e.onGetNewPairingId && e.onGetNewPairingId(t)
        }),
        this.socket.on('updatepaireddevicestatus', function (t) {
          'undefined' != typeof _debug &&
            _debug.logTime(
              'Update paired device state ID: ' +
                t.paireddevice.id +
                ' state: ' +
                t.paireddevice.state
            ),
            e.updatePairedDevice(
              t.paireddevice.id,
              t.paireddevice.type,
              t.paireddevice.state
            ),
            null != e.onUpdatePairedDeviceStatus &&
              e.onUpdatePairedDeviceStatus(t)
        }),
        this.socket.on('command', function (t, n) {
          'undefined' != typeof _debug &&
            _debug.logTime(
              'Command from: ' + t + ', data: ' + JSON.stringify(n)
            ),
            null != e.onCommand && e.onCommand(t, n)
        }),
        this.socket.on('syscommand', function (t, n) {
          'undefined' != typeof _debug &&
            _debug.logTime(
              'SysCommand from: ' + t + ', data: ' + JSON.stringify(n)
            ),
            e.doSystemCommandProcessing(t, n)
        }),
        this.socket.on('removeallpairedresult', function (t, n) {
          'undefined' != typeof _debug &&
            _debug.logTime('Remove all paired result: ' + n),
            e.setKeyValueToCookies('deviceid', ''),
            (e.id = null),
            e.setKeyValueToCookies('devicepaired', ''),
            delete e.paired,
            (e.paired = {}),
            e.disconnect()
        }),
        this.socket.on('disconnect', function () {
          if (
            ((e.connected = !1),
            delete e.pairedOnline,
            (e.pairedOnline = {}),
            (e.NoOfPairedOnline = 0),
            'undefined' != typeof _debug && _debug.logTime('Disconnected'),
            e.inRemoveDevices || null == e.onDisconnected || e.onDisconnected(),
            e.inRemoveDevices)
          ) {
            e.inRemoveDevices = !1
            setTimeout(function () {
              e.createPairingID()
            }, 500)
          }
        }),
        (this.isInit = !0)
    }
  }),
  (Remote.prototype.connect = function () {
    null != this.id && this._connect()
  }),
  (Remote.prototype._connect = function () {
    !this.connected &&
      this.enable &&
      (null == this.socket
        ? ((this.socket = io(this.socketioHost, {
            path: this.socketioPath,
            query:
              'devicetype=' +
              this.deviceTypeName +
              (null != this.id
                ? '&deviceid=' + this.id + '&devicename=' + this.deviceName
                : '')
          })),
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
        'undefined' != typeof this.pairedOnline[e] &&
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
    if (t.command)
      switch (t.command) {
        case 'removepaireddevice':
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
      }
  }),
  (function (e) {
    if ('object' == typeof exports && 'undefined' != typeof module)
      module.exports = e()
    else if ('function' == typeof define && define.amd) define([], e)
    else {
      var t
      ;(t =
        'undefined' != typeof window
          ? window
          : 'undefined' != typeof global
          ? global
          : 'undefined' != typeof self
          ? self
          : this),
        (t.io = e())
    }
  })(function () {
    var e
    return (function t(e, n, o) {
      function r(s, a) {
        if (!n[s]) {
          if (!e[s]) {
            var c = 'function' == typeof require && require
            if (!a && c) return c(s, !0)
            if (i) return i(s, !0)
            var p = new Error("Cannot find module '" + s + "'")
            throw ((p.code = 'MODULE_NOT_FOUND'), p)
          }
          var u = (n[s] = { exports: {} })
          e[s][0].call(
            u.exports,
            function (t) {
              var n = e[s][1][t]
              return r(n ? n : t)
            },
            u,
            u.exports,
            t,
            e,
            n,
            o
          )
        }
        return n[s].exports
      }
      for (
        var i = 'function' == typeof require && require, s = 0;
        s < o.length;
        s++
      )
        r(o[s])
      return r
    })(
      {
        1: [
          function (e, t, n) {
            t.exports = e('./lib/')
          },
          { './lib/': 2 }
        ],
        2: [
          function (e, t, n) {
            ;(t.exports = e('./socket')),
              (t.exports.parser = e('engine.io-parser'))
          },
          { './socket': 3, 'engine.io-parser': 19 }
        ],
        3: [
          function (e, t, n) {
            ;(function (n) {
              function o(e, t) {
                if (!(this instanceof o)) return new o(e, t)
                ;(t = t || {}),
                  e && 'object' == typeof e && ((t = e), (e = null)),
                  e
                    ? ((e = u(e)),
                      (t.hostname = e.host),
                      (t.secure = 'https' == e.protocol || 'wss' == e.protocol),
                      (t.port = e.port),
                      e.query && (t.query = e.query))
                    : t.host && (t.hostname = u(t.host).host),
                  (this.secure =
                    null != t.secure
                      ? t.secure
                      : n.location && 'https:' == location.protocol),
                  t.hostname &&
                    !t.port &&
                    (t.port = this.secure ? '443' : '80'),
                  (this.agent = t.agent || !1),
                  (this.hostname =
                    t.hostname ||
                    (n.location ? location.hostname : 'localhost')),
                  (this.port =
                    t.port ||
                    (n.location && location.port
                      ? location.port
                      : this.secure
                      ? 443
                      : 80)),
                  (this.query = t.query || {}),
                  'string' == typeof this.query &&
                    (this.query = f.decode(this.query)),
                  (this.upgrade = !1 !== t.upgrade),
                  (this.path =
                    (t.path || '/engine.io').replace(/\/$/, '') + '/'),
                  (this.forceJSONP = !!t.forceJSONP),
                  (this.jsonp = !1 !== t.jsonp),
                  (this.forceBase64 = !!t.forceBase64),
                  (this.enablesXDR = !!t.enablesXDR),
                  (this.timestampParam = t.timestampParam || 't'),
                  (this.timestampRequests = t.timestampRequests),
                  (this.transports = t.transports || ['polling', 'websocket']),
                  (this.readyState = ''),
                  (this.writeBuffer = []),
                  (this.policyPort = t.policyPort || 843),
                  (this.rememberUpgrade = t.rememberUpgrade || !1),
                  (this.binaryType = null),
                  (this.onlyBinaryUpgrades = t.onlyBinaryUpgrades),
                  (this.perMessageDeflate =
                    !1 !== t.perMessageDeflate
                      ? t.perMessageDeflate || {}
                      : !1),
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
                    void 0 === t.rejectUnauthorized
                      ? null
                      : t.rejectUnauthorized)
                var r = 'object' == typeof n && n
                r.global === r &&
                  t.extraHeaders &&
                  Object.keys(t.extraHeaders).length > 0 &&
                  (this.extraHeaders = t.extraHeaders),
                  this.open()
              }
              function r(e) {
                var t = {}
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n])
                return t
              }
              var i = e('./transports'),
                s = e('component-emitter'),
                a = e('debug')('engine.io-client:socket'),
                c = e('indexof'),
                p = e('engine.io-parser'),
                u = e('parseuri'),
                h = e('parsejson'),
                f = e('parseqs')
              ;(t.exports = o),
                (o.priorWebsocketSuccess = !1),
                s(o.prototype),
                (o.protocol = p.protocol),
                (o.Socket = o),
                (o.Transport = e('./transport')),
                (o.transports = e('./transports')),
                (o.parser = e('engine.io-parser')),
                (o.prototype.createTransport = function (e) {
                  a('creating transport "%s"', e)
                  var t = r(this.query)
                  ;(t.EIO = p.protocol),
                    (t.transport = e),
                    this.id && (t.sid = this.id)
                  var n = new i[e]({
                    agent: this.agent,
                    hostname: this.hostname,
                    port: this.port,
                    secure: this.secure,
                    path: this.path,
                    query: t,
                    forceJSONP: this.forceJSONP,
                    jsonp: this.jsonp,
                    forceBase64: this.forceBase64,
                    enablesXDR: this.enablesXDR,
                    timestampRequests: this.timestampRequests,
                    timestampParam: this.timestampParam,
                    policyPort: this.policyPort,
                    socket: this,
                    pfx: this.pfx,
                    key: this.key,
                    passphrase: this.passphrase,
                    cert: this.cert,
                    ca: this.ca,
                    ciphers: this.ciphers,
                    rejectUnauthorized: this.rejectUnauthorized,
                    perMessageDeflate: this.perMessageDeflate,
                    extraHeaders: this.extraHeaders
                  })
                  return n
                }),
                (o.prototype.open = function () {
                  var e
                  if (
                    this.rememberUpgrade &&
                    o.priorWebsocketSuccess &&
                    -1 != this.transports.indexOf('websocket')
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
                  } catch (n) {
                    return this.transports.shift(), void this.open()
                  }
                  e.open(), this.setTransport(e)
                }),
                (o.prototype.setTransport = function (e) {
                  a('setting transport %s', e.name)
                  var t = this
                  this.transport &&
                    (a('clearing existing transport %s', this.transport.name),
                    this.transport.removeAllListeners()),
                    (this.transport = e),
                    e
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
                (o.prototype.probe = function (e) {
                  function t() {
                    if (f.onlyBinaryUpgrades) {
                      var t = !this.supportsBinary && f.transport.supportsBinary
                      h = h || t
                    }
                    h ||
                      (a('probe transport "%s" opened', e),
                      u.send([{ type: 'ping', data: 'probe' }]),
                      u.once('packet', function (t) {
                        if (!h)
                          if ('pong' == t.type && 'probe' == t.data) {
                            if (
                              (a('probe transport "%s" pong', e),
                              (f.upgrading = !0),
                              f.emit('upgrading', u),
                              !u)
                            )
                              return
                            ;(o.priorWebsocketSuccess = 'websocket' == u.name),
                              a(
                                'pausing current transport "%s"',
                                f.transport.name
                              ),
                              f.transport.pause(function () {
                                h ||
                                  ('closed' != f.readyState &&
                                    (a(
                                      'changing transport and sending upgrade packet'
                                    ),
                                    p(),
                                    f.setTransport(u),
                                    u.send([{ type: 'upgrade' }]),
                                    f.emit('upgrade', u),
                                    (u = null),
                                    (f.upgrading = !1),
                                    f.flush()))
                              })
                          } else {
                            a('probe transport "%s" failed', e)
                            var n = new Error('probe error')
                            ;(n.transport = u.name), f.emit('upgradeError', n)
                          }
                      }))
                  }
                  function n() {
                    h || ((h = !0), p(), u.close(), (u = null))
                  }
                  function r(t) {
                    var o = new Error('probe error: ' + t)
                    ;(o.transport = u.name),
                      n(),
                      a(
                        'probe transport "%s" failed because of error: %s',
                        e,
                        t
                      ),
                      f.emit('upgradeError', o)
                  }
                  function i() {
                    r('transport closed')
                  }
                  function s() {
                    r('socket closed')
                  }
                  function c(e) {
                    u &&
                      e.name != u.name &&
                      (a('"%s" works - aborting "%s"', e.name, u.name), n())
                  }
                  function p() {
                    u.removeListener('open', t),
                      u.removeListener('error', r),
                      u.removeListener('close', i),
                      f.removeListener('close', s),
                      f.removeListener('upgrading', c)
                  }
                  a('probing transport "%s"', e)
                  var u = this.createTransport(e, { probe: 1 }),
                    h = !1,
                    f = this
                  ;(o.priorWebsocketSuccess = !1),
                    u.once('open', t),
                    u.once('error', r),
                    u.once('close', i),
                    this.once('close', s),
                    this.once('upgrading', c),
                    u.open()
                }),
                (o.prototype.onOpen = function () {
                  if (
                    (a('socket open'),
                    (this.readyState = 'open'),
                    (o.priorWebsocketSuccess =
                      'websocket' == this.transport.name),
                    this.emit('open'),
                    this.flush(),
                    'open' == this.readyState &&
                      this.upgrade &&
                      this.transport.pause)
                  ) {
                    a('starting upgrade probes')
                    for (var e = 0, t = this.upgrades.length; t > e; e++)
                      this.probe(this.upgrades[e])
                  }
                }),
                (o.prototype.onPacket = function (e) {
                  if ('opening' == this.readyState || 'open' == this.readyState)
                    switch (
                      (a(
                        'socket receive: type "%s", data "%s"',
                        e.type,
                        e.data
                      ),
                      this.emit('packet', e),
                      this.emit('heartbeat'),
                      e.type)
                    ) {
                      case 'open':
                        this.onHandshake(h(e.data))
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
                    a(
                      'packet received with socket readyState "%s"',
                      this.readyState
                    )
                }),
                (o.prototype.onHandshake = function (e) {
                  this.emit('handshake', e),
                    (this.id = e.sid),
                    (this.transport.query.sid = e.sid),
                    (this.upgrades = this.filterUpgrades(e.upgrades)),
                    (this.pingInterval = e.pingInterval),
                    (this.pingTimeout = e.pingTimeout),
                    this.onOpen(),
                    'closed' != this.readyState &&
                      (this.setPing(),
                      this.removeListener('heartbeat', this.onHeartbeat),
                      this.on('heartbeat', this.onHeartbeat))
                }),
                (o.prototype.onHeartbeat = function (e) {
                  clearTimeout(this.pingTimeoutTimer)
                  var t = this
                  t.pingTimeoutTimer = setTimeout(function () {
                    'closed' != t.readyState && t.onClose('ping timeout')
                  }, e || t.pingInterval + t.pingTimeout)
                }),
                (o.prototype.setPing = function () {
                  var e = this
                  clearTimeout(e.pingIntervalTimer),
                    (e.pingIntervalTimer = setTimeout(function () {
                      a(
                        'writing ping packet - expecting pong within %sms',
                        e.pingTimeout
                      ),
                        e.ping(),
                        e.onHeartbeat(e.pingTimeout)
                    }, e.pingInterval))
                }),
                (o.prototype.ping = function () {
                  var e = this
                  this.sendPacket('ping', function () {
                    e.emit('ping')
                  })
                }),
                (o.prototype.onDrain = function () {
                  this.writeBuffer.splice(0, this.prevBufferLen),
                    (this.prevBufferLen = 0),
                    0 === this.writeBuffer.length
                      ? this.emit('drain')
                      : this.flush()
                }),
                (o.prototype.flush = function () {
                  'closed' != this.readyState &&
                    this.transport.writable &&
                    !this.upgrading &&
                    this.writeBuffer.length &&
                    (a(
                      'flushing %d packets in socket',
                      this.writeBuffer.length
                    ),
                    this.transport.send(this.writeBuffer),
                    (this.prevBufferLen = this.writeBuffer.length),
                    this.emit('flush'))
                }),
                (o.prototype.write = o.prototype.send =
                  function (e, t, n) {
                    return this.sendPacket('message', e, t, n), this
                  }),
                (o.prototype.sendPacket = function (e, t, n, o) {
                  if (
                    ('function' == typeof t && ((o = t), (t = void 0)),
                    'function' == typeof n && ((o = n), (n = null)),
                    'closing' != this.readyState && 'closed' != this.readyState)
                  ) {
                    ;(n = n || {}), (n.compress = !1 !== n.compress)
                    var r = { type: e, data: t, options: n }
                    this.emit('packetCreate', r),
                      this.writeBuffer.push(r),
                      o && this.once('flush', o),
                      this.flush()
                  }
                }),
                (o.prototype.close = function () {
                  function e() {
                    o.onClose('forced close'),
                      a('socket closing - telling transport to close'),
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
                  if (
                    'opening' == this.readyState ||
                    'open' == this.readyState
                  ) {
                    this.readyState = 'closing'
                    var o = this
                    this.writeBuffer.length
                      ? this.once('drain', function () {
                          this.upgrading ? n() : e()
                        })
                      : this.upgrading
                      ? n()
                      : e()
                  }
                  return this
                }),
                (o.prototype.onError = function (e) {
                  a('socket error %j', e),
                    (o.priorWebsocketSuccess = !1),
                    this.emit('error', e),
                    this.onClose('transport error', e)
                }),
                (o.prototype.onClose = function (e, t) {
                  if (
                    'opening' == this.readyState ||
                    'open' == this.readyState ||
                    'closing' == this.readyState
                  ) {
                    a('socket close with reason: "%s"', e)
                    var n = this
                    clearTimeout(this.pingIntervalTimer),
                      clearTimeout(this.pingTimeoutTimer),
                      this.transport.removeAllListeners('close'),
                      this.transport.close(),
                      this.transport.removeAllListeners(),
                      (this.readyState = 'closed'),
                      (this.id = null),
                      this.emit('close', e, t),
                      (n.writeBuffer = []),
                      (n.prevBufferLen = 0)
                  }
                }),
                (o.prototype.filterUpgrades = function (e) {
                  for (var t = [], n = 0, o = e.length; o > n; n++)
                    ~c(this.transports, e[n]) && t.push(e[n])
                  return t
                })
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {
            './transport': 4,
            './transports': 5,
            'component-emitter': 15,
            debug: 17,
            'engine.io-parser': 19,
            indexof: 23,
            parsejson: 26,
            parseqs: 27,
            parseuri: 28
          }
        ],
        4: [
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
                (this.pfx = e.pfx),
                (this.key = e.key),
                (this.passphrase = e.passphrase),
                (this.cert = e.cert),
                (this.ca = e.ca),
                (this.ciphers = e.ciphers),
                (this.rejectUnauthorized = e.rejectUnauthorized),
                (this.extraHeaders = e.extraHeaders)
            }
            var r = e('engine.io-parser'),
              i = e('component-emitter')
            ;(t.exports = o),
              i(o.prototype),
              (o.prototype.onError = function (e, t) {
                var n = new Error(e)
                return (
                  (n.type = 'TransportError'),
                  (n.description = t),
                  this.emit('error', n),
                  this
                )
              }),
              (o.prototype.open = function () {
                return (
                  ('closed' != this.readyState && '' != this.readyState) ||
                    ((this.readyState = 'opening'), this.doOpen()),
                  this
                )
              }),
              (o.prototype.close = function () {
                return (
                  ('opening' != this.readyState && 'open' != this.readyState) ||
                    (this.doClose(), this.onClose()),
                  this
                )
              }),
              (o.prototype.send = function (e) {
                if ('open' != this.readyState)
                  throw new Error('Transport not open')
                this.write(e)
              }),
              (o.prototype.onOpen = function () {
                ;(this.readyState = 'open'),
                  (this.writable = !0),
                  this.emit('open')
              }),
              (o.prototype.onData = function (e) {
                var t = r.decodePacket(e, this.socket.binaryType)
                this.onPacket(t)
              }),
              (o.prototype.onPacket = function (e) {
                this.emit('packet', e)
              }),
              (o.prototype.onClose = function () {
                ;(this.readyState = 'closed'), this.emit('close')
              })
          },
          { 'component-emitter': 15, 'engine.io-parser': 19 }
        ],
        5: [
          function (e, t, n) {
            ;(function (t) {
              function o(e) {
                var n,
                  o = !1,
                  a = !1,
                  c = !1 !== e.jsonp
                if (t.location) {
                  var p = 'https:' == location.protocol,
                    u = location.port
                  u || (u = p ? 443 : 80),
                    (o = e.hostname != location.hostname || u != e.port),
                    (a = e.secure != p)
                }
                if (
                  ((e.xdomain = o),
                  (e.xscheme = a),
                  (n = new r(e)),
                  'open' in n && !e.forceJSONP)
                )
                  return new i(e)
                if (!c) throw new Error('JSONP disabled')
                return new s(e)
              }
              var r = e('xmlhttprequest-ssl'),
                i = e('./polling-xhr'),
                s = e('./polling-jsonp'),
                a = e('./websocket')
              ;(n.polling = o), (n.websocket = a)
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {
            './polling-jsonp': 6,
            './polling-xhr': 7,
            './websocket': 9,
            'xmlhttprequest-ssl': 10
          }
        ],
        6: [
          function (e, t, n) {
            ;(function (n) {
              function o() {}
              function r(e) {
                i.call(this, e),
                  (this.query = this.query || {}),
                  a || (n.___eio || (n.___eio = []), (a = n.___eio)),
                  (this.index = a.length)
                var t = this
                a.push(function (e) {
                  t.onData(e)
                }),
                  (this.query.j = this.index),
                  n.document &&
                    n.addEventListener &&
                    n.addEventListener(
                      'beforeunload',
                      function () {
                        t.script && (t.script.onerror = o)
                      },
                      !1
                    )
              }
              var i = e('./polling'),
                s = e('component-inherit')
              t.exports = r
              var a,
                c = /\n/g,
                p = /\\n/g
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
                  var e = this,
                    t = document.createElement('script')
                  this.script &&
                    (this.script.parentNode.removeChild(this.script),
                    (this.script = null)),
                    (t.async = !0),
                    (t.src = this.uri()),
                    (t.onerror = function (t) {
                      e.onError('jsonp poll error', t)
                    })
                  var n = document.getElementsByTagName('script')[0]
                  n
                    ? n.parentNode.insertBefore(t, n)
                    : (document.head || document.body).appendChild(t),
                    (this.script = t)
                  var o =
                    'undefined' != typeof navigator &&
                    /gecko/i.test(navigator.userAgent)
                  o &&
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
                    if (r.iframe)
                      try {
                        r.form.removeChild(r.iframe)
                      } catch (e) {
                        r.onError('jsonp polling iframe removal error', e)
                      }
                    try {
                      var t =
                        '<iframe src="javascript:0" name="' + r.iframeId + '">'
                      i = document.createElement(t)
                    } catch (e) {
                      ;(i = document.createElement('iframe')),
                        (i.name = r.iframeId),
                        (i.src = 'javascript:0')
                    }
                    ;(i.id = r.iframeId), r.form.appendChild(i), (r.iframe = i)
                  }
                  var r = this
                  if (!this.form) {
                    var i,
                      s = document.createElement('form'),
                      a = document.createElement('textarea'),
                      u = (this.iframeId = 'eio_iframe_' + this.index)
                    ;(s.className = 'socketio'),
                      (s.style.position = 'absolute'),
                      (s.style.top = '-1000px'),
                      (s.style.left = '-1000px'),
                      (s.target = u),
                      (s.method = 'POST'),
                      s.setAttribute('accept-charset', 'utf-8'),
                      (a.name = 'd'),
                      s.appendChild(a),
                      document.body.appendChild(s),
                      (this.form = s),
                      (this.area = a)
                  }
                  ;(this.form.action = this.uri()),
                    o(),
                    (e = e.replace(p, '\\\n')),
                    (this.area.value = e.replace(c, '\\n'))
                  try {
                    this.form.submit()
                  } catch (h) {}
                  this.iframe.attachEvent
                    ? (this.iframe.onreadystatechange = function () {
                        'complete' == r.iframe.readyState && n()
                      })
                    : (this.iframe.onload = n)
                })
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          { './polling': 8, 'component-inherit': 16 }
        ],
        7: [
          function (e, t, n) {
            ;(function (n) {
              function o() {}
              function r(e) {
                if ((c.call(this, e), n.location)) {
                  var t = 'https:' == location.protocol,
                    o = location.port
                  o || (o = t ? 443 : 80),
                    (this.xd =
                      e.hostname != n.location.hostname || o != e.port),
                    (this.xs = e.secure != t)
                } else this.extraHeaders = e.extraHeaders
              }
              function i(e) {
                ;(this.method = e.method || 'GET'),
                  (this.uri = e.uri),
                  (this.xd = !!e.xd),
                  (this.xs = !!e.xs),
                  (this.async = !1 !== e.async),
                  (this.data = void 0 != e.data ? e.data : null),
                  (this.agent = e.agent),
                  (this.isBinary = e.isBinary),
                  (this.supportsBinary = e.supportsBinary),
                  (this.enablesXDR = e.enablesXDR),
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
              var a = e('xmlhttprequest-ssl'),
                c = e('./polling'),
                p = e('component-emitter'),
                u = e('component-inherit'),
                h = e('debug')('engine.io-client:polling-xhr')
              ;(t.exports = r),
                (t.exports.Request = i),
                u(r, c),
                (r.prototype.supportsBinary = !0),
                (r.prototype.request = function (e) {
                  return (
                    (e = e || {}),
                    (e.uri = this.uri()),
                    (e.xd = this.xd),
                    (e.xs = this.xs),
                    (e.agent = this.agent || !1),
                    (e.supportsBinary = this.supportsBinary),
                    (e.enablesXDR = this.enablesXDR),
                    (e.pfx = this.pfx),
                    (e.key = this.key),
                    (e.passphrase = this.passphrase),
                    (e.cert = this.cert),
                    (e.ca = this.ca),
                    (e.ciphers = this.ciphers),
                    (e.rejectUnauthorized = this.rejectUnauthorized),
                    (e.extraHeaders = this.extraHeaders),
                    new i(e)
                  )
                }),
                (r.prototype.doWrite = function (e, t) {
                  var n = 'string' != typeof e && void 0 !== e,
                    o = this.request({ method: 'POST', data: e, isBinary: n }),
                    r = this
                  o.on('success', t),
                    o.on('error', function (e) {
                      r.onError('xhr post error', e)
                    }),
                    (this.sendXhr = o)
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
                    o = this
                  try {
                    h('xhr open %s: %s', this.method, this.uri),
                      t.open(this.method, this.uri, this.async)
                    try {
                      if (this.extraHeaders) {
                        t.setDisableHeaderCheck(!0)
                        for (var r in this.extraHeaders)
                          this.extraHeaders.hasOwnProperty(r) &&
                            t.setRequestHeader(r, this.extraHeaders[r])
                      }
                    } catch (s) {}
                    if (
                      (this.supportsBinary && (t.responseType = 'arraybuffer'),
                      'POST' == this.method)
                    )
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
                      } catch (s) {}
                    'withCredentials' in t && (t.withCredentials = !0),
                      this.hasXDR()
                        ? ((t.onload = function () {
                            o.onLoad()
                          }),
                          (t.onerror = function () {
                            o.onError(t.responseText)
                          }))
                        : (t.onreadystatechange = function () {
                            4 == t.readyState &&
                              (200 == t.status || 1223 == t.status
                                ? o.onLoad()
                                : setTimeout(function () {
                                    o.onError(t.status)
                                  }, 0))
                          }),
                      h('xhr data %s', this.data),
                      t.send(this.data)
                  } catch (s) {
                    return void setTimeout(function () {
                      o.onError(s)
                    }, 0)
                  }
                  n.document &&
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
                  if ('undefined' != typeof this.xhr && null !== this.xhr) {
                    if (
                      (this.hasXDR()
                        ? (this.xhr.onload = this.xhr.onerror = o)
                        : (this.xhr.onreadystatechange = o),
                      e)
                    )
                      try {
                        this.xhr.abort()
                      } catch (t) {}
                    n.document && delete i.requests[this.index],
                      (this.xhr = null)
                  }
                }),
                (i.prototype.onLoad = function () {
                  var e
                  try {
                    var t
                    try {
                      t = this.xhr
                        .getResponseHeader('Content-Type')
                        .split(';')[0]
                    } catch (n) {}
                    if ('application/octet-stream' === t) e = this.xhr.response
                    else if (this.supportsBinary)
                      try {
                        e = String.fromCharCode.apply(
                          null,
                          new Uint8Array(this.xhr.response)
                        )
                      } catch (n) {
                        for (
                          var o = new Uint8Array(this.xhr.response),
                            r = [],
                            i = 0,
                            s = o.length;
                          s > i;
                          i++
                        )
                          r.push(o[i])
                        e = String.fromCharCode.apply(null, r)
                      }
                    else e = this.xhr.responseText
                  } catch (n) {
                    this.onError(n)
                  }
                  null != e && this.onData(e)
                }),
                (i.prototype.hasXDR = function () {
                  return (
                    'undefined' != typeof n.XDomainRequest &&
                    !this.xs &&
                    this.enablesXDR
                  )
                }),
                (i.prototype.abort = function () {
                  this.cleanup()
                }),
                n.document &&
                  ((i.requestsCount = 0),
                  (i.requests = {}),
                  n.attachEvent
                    ? n.attachEvent('onunload', s)
                    : n.addEventListener &&
                      n.addEventListener('beforeunload', s, !1))
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {
            './polling': 8,
            'component-emitter': 15,
            'component-inherit': 16,
            debug: 17,
            'xmlhttprequest-ssl': 10
          }
        ],
        8: [
          function (e, t, n) {
            function o(e) {
              var t = e && e.forceBase64
              ;(u && !t) || (this.supportsBinary = !1), r.call(this, e)
            }
            var r = e('../transport'),
              i = e('parseqs'),
              s = e('engine.io-parser'),
              a = e('component-inherit'),
              c = e('yeast'),
              p = e('debug')('engine.io-client:polling')
            t.exports = o
            var u = (function () {
              var t = e('xmlhttprequest-ssl'),
                n = new t({ xdomain: !1 })
              return null != n.responseType
            })()
            a(o, r),
              (o.prototype.name = 'polling'),
              (o.prototype.doOpen = function () {
                this.poll()
              }),
              (o.prototype.pause = function (e) {
                function t() {
                  p('paused'), (n.readyState = 'paused'), e()
                }
                var n = this
                if (
                  ((this.readyState = 'pausing'),
                  this.polling || !this.writable)
                ) {
                  var o = 0
                  this.polling &&
                    (p('we are currently polling - waiting to pause'),
                    o++,
                    this.once('pollComplete', function () {
                      p('pre-pause polling complete'), --o || t()
                    })),
                    this.writable ||
                      (p('we are currently writing - waiting to pause'),
                      o++,
                      this.once('drain', function () {
                        p('pre-pause writing complete'), --o || t()
                      }))
                } else t()
              }),
              (o.prototype.poll = function () {
                p('polling'),
                  (this.polling = !0),
                  this.doPoll(),
                  this.emit('poll')
              }),
              (o.prototype.onData = function (e) {
                var t = this
                p('polling got data %s', e)
                var n = function (e, n, o) {
                  return (
                    'opening' == t.readyState && t.onOpen(),
                    'close' == e.type ? (t.onClose(), !1) : void t.onPacket(e)
                  )
                }
                s.decodePayload(e, this.socket.binaryType, n),
                  'closed' != this.readyState &&
                    ((this.polling = !1),
                    this.emit('pollComplete'),
                    'open' == this.readyState
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
                'open' == this.readyState
                  ? (p('transport open - closing'), e())
                  : (p('transport not open - deferring close'),
                    this.once('open', e))
              }),
              (o.prototype.write = function (e) {
                var t = this
                this.writable = !1
                var n = function () {
                    ;(t.writable = !0), t.emit('drain')
                  },
                  t = this
                s.encodePayload(e, this.supportsBinary, function (e) {
                  t.doWrite(e, n)
                })
              }),
              (o.prototype.uri = function () {
                var e = this.query || {},
                  t = this.secure ? 'https' : 'http',
                  n = ''
                !1 !== this.timestampRequests && (e[this.timestampParam] = c()),
                  this.supportsBinary || e.sid || (e.b64 = 1),
                  (e = i.encode(e)),
                  this.port &&
                    (('https' == t && 443 != this.port) ||
                      ('http' == t && 80 != this.port)) &&
                    (n = ':' + this.port),
                  e.length && (e = '?' + e)
                var o = -1 !== this.hostname.indexOf(':')
                return (
                  t +
                  '://' +
                  (o ? '[' + this.hostname + ']' : this.hostname) +
                  n +
                  this.path +
                  e
                )
              })
          },
          {
            '../transport': 4,
            'component-inherit': 16,
            debug: 17,
            'engine.io-parser': 19,
            parseqs: 27,
            'xmlhttprequest-ssl': 10,
            yeast: 30
          }
        ],
        9: [
          function (e, t, n) {
            ;(function (n) {
              function o(e) {
                var t = e && e.forceBase64
                t && (this.supportsBinary = !1),
                  (this.perMessageDeflate = e.perMessageDeflate),
                  r.call(this, e)
              }
              var r = e('../transport'),
                i = e('engine.io-parser'),
                s = e('parseqs'),
                a = e('component-inherit'),
                c = e('yeast'),
                p = e('debug')('engine.io-client:websocket'),
                u = n.WebSocket || n.MozWebSocket,
                h = u
              if (!h && 'undefined' == typeof window)
                try {
                  h = e('ws')
                } catch (f) {}
              ;(t.exports = o),
                a(o, r),
                (o.prototype.name = 'websocket'),
                (o.prototype.supportsBinary = !0),
                (o.prototype.doOpen = function () {
                  if (this.check()) {
                    var e = this.uri(),
                      t = void 0,
                      n = {
                        agent: this.agent,
                        perMessageDeflate: this.perMessageDeflate
                      }
                    ;(n.pfx = this.pfx),
                      (n.key = this.key),
                      (n.passphrase = this.passphrase),
                      (n.cert = this.cert),
                      (n.ca = this.ca),
                      (n.ciphers = this.ciphers),
                      (n.rejectUnauthorized = this.rejectUnauthorized),
                      this.extraHeaders && (n.headers = this.extraHeaders),
                      (this.ws = u ? new h(e) : new h(e, t, n)),
                      void 0 === this.ws.binaryType &&
                        (this.supportsBinary = !1),
                      this.ws.supports && this.ws.supports.binary
                        ? ((this.supportsBinary = !0),
                          (this.ws.binaryType = 'buffer'))
                        : (this.ws.binaryType = 'arraybuffer'),
                      this.addEventListeners()
                  }
                }),
                (o.prototype.addEventListeners = function () {
                  var e = this
                  ;(this.ws.onopen = function () {
                    e.onOpen()
                  }),
                    (this.ws.onclose = function () {
                      e.onClose()
                    }),
                    (this.ws.onmessage = function (t) {
                      e.onData(t.data)
                    }),
                    (this.ws.onerror = function (t) {
                      e.onError('websocket error', t)
                    })
                }),
                'undefined' != typeof navigator &&
                  /iPad|iPhone|iPod/i.test(navigator.userAgent) &&
                  (o.prototype.onData = function (e) {
                    var t = this
                    setTimeout(function () {
                      r.prototype.onData.call(t, e)
                    }, 0)
                  }),
                (o.prototype.write = function (e) {
                  function t() {
                    o.emit('flush'),
                      setTimeout(function () {
                        ;(o.writable = !0), o.emit('drain')
                      }, 0)
                  }
                  var o = this
                  this.writable = !1
                  for (var r = e.length, s = 0, a = r; a > s; s++)
                    !(function (e) {
                      i.encodePacket(e, o.supportsBinary, function (i) {
                        if (!u) {
                          var s = {}
                          if (
                            (e.options && (s.compress = e.options.compress),
                            o.perMessageDeflate)
                          ) {
                            var a =
                              'string' == typeof i
                                ? n.Buffer.byteLength(i)
                                : i.length
                            a < o.perMessageDeflate.threshold &&
                              (s.compress = !1)
                          }
                        }
                        try {
                          u ? o.ws.send(i) : o.ws.send(i, s)
                        } catch (c) {
                          p('websocket closed before onclose event')
                        }
                        --r || t()
                      })
                    })(e[s])
                }),
                (o.prototype.onClose = function () {
                  r.prototype.onClose.call(this)
                }),
                (o.prototype.doClose = function () {
                  'undefined' != typeof this.ws && this.ws.close()
                }),
                (o.prototype.uri = function () {
                  var e = this.query || {},
                    t = this.secure ? 'wss' : 'ws',
                    n = ''
                  this.port &&
                    (('wss' == t && 443 != this.port) ||
                      ('ws' == t && 80 != this.port)) &&
                    (n = ':' + this.port),
                    this.timestampRequests && (e[this.timestampParam] = c()),
                    this.supportsBinary || (e.b64 = 1),
                    (e = s.encode(e)),
                    e.length && (e = '?' + e)
                  var o = -1 !== this.hostname.indexOf(':')
                  return (
                    t +
                    '://' +
                    (o ? '[' + this.hostname + ']' : this.hostname) +
                    n +
                    this.path +
                    e
                  )
                }),
                (o.prototype.check = function () {
                  return !(
                    !h ||
                    ('__initialize' in h && this.name === o.prototype.name)
                  )
                })
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {
            '../transport': 4,
            'component-inherit': 16,
            debug: 17,
            'engine.io-parser': 19,
            parseqs: 27,
            ws: void 0,
            yeast: 30
          }
        ],
        10: [
          function (e, t, n) {
            var o = e('has-cors')
            t.exports = function (e) {
              var t = e.xdomain,
                n = e.xscheme,
                r = e.enablesXDR
              try {
                if ('undefined' != typeof XMLHttpRequest && (!t || o))
                  return new XMLHttpRequest()
              } catch (i) {}
              try {
                if ('undefined' != typeof XDomainRequest && !n && r)
                  return new XDomainRequest()
              } catch (i) {}
              if (!t)
                try {
                  return new ActiveXObject('Microsoft.XMLHTTP')
                } catch (i) {}
            }
          },
          { 'has-cors': 22 }
        ],
        11: [
          function (e, t, n) {
            function o(e, t, n) {
              function o(e, r) {
                if (o.count <= 0) throw new Error('after called too many times')
                --o.count,
                  e
                    ? ((i = !0), t(e), (t = n))
                    : 0 !== o.count || i || t(null, r)
              }
              var i = !1
              return (n = n || r), (o.count = e), 0 === e ? t() : o
            }
            function r() {}
            t.exports = o
          },
          {}
        ],
        12: [
          function (e, t, n) {
            t.exports = function (e, t, n) {
              var o = e.byteLength
              if (((t = t || 0), (n = n || o), e.slice)) return e.slice(t, n)
              if (
                (0 > t && (t += o),
                0 > n && (n += o),
                n > o && (n = o),
                t >= o || t >= n || 0 === o)
              )
                return new ArrayBuffer(0)
              for (
                var r = new Uint8Array(e),
                  i = new Uint8Array(n - t),
                  s = t,
                  a = 0;
                n > s;
                s++, a++
              )
                i[a] = r[s]
              return i.buffer
            }
          },
          {}
        ],
        13: [
          function (e, t, n) {
            !(function (e) {
              'use strict'
              ;(n.encode = function (t) {
                var n,
                  o = new Uint8Array(t),
                  r = o.length,
                  i = ''
                for (n = 0; r > n; n += 3)
                  (i += e[o[n] >> 2]),
                    (i += e[((3 & o[n]) << 4) | (o[n + 1] >> 4)]),
                    (i += e[((15 & o[n + 1]) << 2) | (o[n + 2] >> 6)]),
                    (i += e[63 & o[n + 2]])
                return (
                  r % 3 === 2
                    ? (i = i.substring(0, i.length - 1) + '=')
                    : r % 3 === 1 && (i = i.substring(0, i.length - 2) + '=='),
                  i
                )
              }),
                (n.decode = function (t) {
                  var n,
                    o,
                    r,
                    i,
                    s,
                    a = 0.75 * t.length,
                    c = t.length,
                    p = 0
                  '=' === t[t.length - 1] &&
                    (a--, '=' === t[t.length - 2] && a--)
                  var u = new ArrayBuffer(a),
                    h = new Uint8Array(u)
                  for (n = 0; c > n; n += 4)
                    (o = e.indexOf(t[n])),
                      (r = e.indexOf(t[n + 1])),
                      (i = e.indexOf(t[n + 2])),
                      (s = e.indexOf(t[n + 3])),
                      (h[p++] = (o << 2) | (r >> 4)),
                      (h[p++] = ((15 & r) << 4) | (i >> 2)),
                      (h[p++] = ((3 & i) << 6) | (63 & s))
                  return u
                })
            })(
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
            )
          },
          {}
        ],
        14: [
          function (e, t, n) {
            ;(function (e) {
              function n(e) {
                for (var t = 0; t < e.length; t++) {
                  var n = e[t]
                  if (n.buffer instanceof ArrayBuffer) {
                    var o = n.buffer
                    if (n.byteLength !== o.byteLength) {
                      var r = new Uint8Array(n.byteLength)
                      r.set(new Uint8Array(o, n.byteOffset, n.byteLength)),
                        (o = r.buffer)
                    }
                    e[t] = o
                  }
                }
              }
              function o(e, t) {
                t = t || {}
                var o = new i()
                n(e)
                for (var r = 0; r < e.length; r++) o.append(e[r])
                return t.type ? o.getBlob(t.type) : o.getBlob()
              }
              function r(e, t) {
                return n(e), new Blob(e, t || {})
              }
              var i =
                  e.BlobBuilder ||
                  e.WebKitBlobBuilder ||
                  e.MSBlobBuilder ||
                  e.MozBlobBuilder,
                s = (function () {
                  try {
                    var e = new Blob(['hi'])
                    return 2 === e.size
                  } catch (t) {
                    return !1
                  }
                })(),
                a =
                  s &&
                  (function () {
                    try {
                      var e = new Blob([new Uint8Array([1, 2])])
                      return 2 === e.size
                    } catch (t) {
                      return !1
                    }
                  })(),
                c = i && i.prototype.append && i.prototype.getBlob
              t.exports = (function () {
                return s ? (a ? e.Blob : r) : c ? o : void 0
              })()
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {}
        ],
        15: [
          function (e, t, n) {
            function o(e) {
              return e ? r(e) : void 0
            }
            function r(e) {
              for (var t in o.prototype) e[t] = o.prototype[t]
              return e
            }
            ;(t.exports = o),
              (o.prototype.on = o.prototype.addEventListener =
                function (e, t) {
                  return (
                    (this._callbacks = this._callbacks || {}),
                    (this._callbacks[e] = this._callbacks[e] || []).push(t),
                    this
                  )
                }),
              (o.prototype.once = function (e, t) {
                function n() {
                  o.off(e, n), t.apply(this, arguments)
                }
                var o = this
                return (
                  (this._callbacks = this._callbacks || {}),
                  (n.fn = t),
                  this.on(e, n),
                  this
                )
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
                    var n = this._callbacks[e]
                    if (!n) return this
                    if (1 == arguments.length)
                      return delete this._callbacks[e], this
                    for (var o, r = 0; r < n.length; r++)
                      if (((o = n[r]), o === t || o.fn === t)) {
                        n.splice(r, 1)
                        break
                      }
                    return this
                  }),
              (o.prototype.emit = function (e) {
                this._callbacks = this._callbacks || {}
                var t = [].slice.call(arguments, 1),
                  n = this._callbacks[e]
                if (n) {
                  n = n.slice(0)
                  for (var o = 0, r = n.length; r > o; ++o) n[o].apply(this, t)
                }
                return this
              }),
              (o.prototype.listeners = function (e) {
                return (
                  (this._callbacks = this._callbacks || {}),
                  this._callbacks[e] || []
                )
              }),
              (o.prototype.hasListeners = function (e) {
                return !!this.listeners(e).length
              })
          },
          {}
        ],
        16: [
          function (e, t, n) {
            t.exports = function (e, t) {
              var n = function () {}
              ;(n.prototype = t.prototype),
                (e.prototype = new n()),
                (e.prototype.constructor = e)
            }
          },
          {}
        ],
        17: [
          function (e, t, n) {
            function o() {
              return (
                'WebkitAppearance' in document.documentElement.style ||
                (window.console &&
                  (console.firebug || (console.exception && console.table))) ||
                (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                  parseInt(RegExp.$1, 10) >= 31)
              )
            }
            function r() {
              var e = arguments,
                t = this.useColors
              if (
                ((e[0] =
                  (t ? '%c' : '') +
                  this.namespace +
                  (t ? ' %c' : ' ') +
                  e[0] +
                  (t ? '%c ' : ' ') +
                  '+' +
                  n.humanize(this.diff)),
                !t)
              )
                return e
              var o = 'color: ' + this.color
              e = [e[0], o, 'color: inherit'].concat(
                Array.prototype.slice.call(e, 1)
              )
              var r = 0,
                i = 0
              return (
                e[0].replace(/%[a-z%]/g, function (e) {
                  '%%' !== e && (r++, '%c' === e && (i = r))
                }),
                e.splice(i, 0, o),
                e
              )
            }
            function i() {
              return (
                'object' == typeof console &&
                console.log &&
                Function.prototype.apply.call(console.log, console, arguments)
              )
            }
            function s(e) {
              try {
                null == e
                  ? n.storage.removeItem('debug')
                  : (n.storage.debug = e)
              } catch (t) {}
            }
            function a() {
              var e
              try {
                e = n.storage.debug
              } catch (t) {}
              return e
            }
            function c() {
              try {
                return window.localStorage
              } catch (e) {}
            }
            ;(n = t.exports = e('./debug')),
              (n.log = i),
              (n.formatArgs = r),
              (n.save = s),
              (n.load = a),
              (n.useColors = o),
              (n.storage =
                'undefined' != typeof chrome &&
                'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : c()),
              (n.colors = [
                'lightseagreen',
                'forestgreen',
                'goldenrod',
                'dodgerblue',
                'darkorchid',
                'crimson'
              ]),
              (n.formatters.j = function (e) {
                return JSON.stringify(e)
              }),
              n.enable(a())
          },
          { './debug': 18 }
        ],
        18: [
          function (e, t, n) {
            function o() {
              return n.colors[u++ % n.colors.length]
            }
            function r(e) {
              function t() {}
              function r() {
                var e = r,
                  t = +new Date(),
                  i = t - (p || t)
                ;(e.diff = i),
                  (e.prev = p),
                  (e.curr = t),
                  (p = t),
                  null == e.useColors && (e.useColors = n.useColors()),
                  null == e.color && e.useColors && (e.color = o())
                var s = Array.prototype.slice.call(arguments)
                ;(s[0] = n.coerce(s[0])),
                  'string' != typeof s[0] && (s = ['%o'].concat(s))
                var a = 0
                ;(s[0] = s[0].replace(/%([a-z%])/g, function (t, o) {
                  if ('%%' === t) return t
                  a++
                  var r = n.formatters[o]
                  if ('function' == typeof r) {
                    var i = s[a]
                    ;(t = r.call(e, i)), s.splice(a, 1), a--
                  }
                  return t
                })),
                  'function' == typeof n.formatArgs &&
                    (s = n.formatArgs.apply(e, s))
                var c = r.log || n.log || console.log.bind(console)
                c.apply(e, s)
              }
              ;(t.enabled = !1), (r.enabled = !0)
              var i = n.enabled(e) ? r : t
              return (i.namespace = e), i
            }
            function i(e) {
              n.save(e)
              for (
                var t = (e || '').split(/[\s,]+/), o = t.length, r = 0;
                o > r;
                r++
              )
                t[r] &&
                  ((e = t[r].replace(/\*/g, '.*?')),
                  '-' === e[0]
                    ? n.skips.push(new RegExp('^' + e.substr(1) + '$'))
                    : n.names.push(new RegExp('^' + e + '$')))
            }
            function s() {
              n.enable('')
            }
            function a(e) {
              var t, o
              for (t = 0, o = n.skips.length; o > t; t++)
                if (n.skips[t].test(e)) return !1
              for (t = 0, o = n.names.length; o > t; t++)
                if (n.names[t].test(e)) return !0
              return !1
            }
            function c(e) {
              return e instanceof Error ? e.stack || e.message : e
            }
            ;(n = t.exports = r),
              (n.coerce = c),
              (n.disable = s),
              (n.enable = i),
              (n.enabled = a),
              (n.humanize = e('ms')),
              (n.names = []),
              (n.skips = []),
              (n.formatters = {})
            var p,
              u = 0
          },
          { ms: 25 }
        ],
        19: [
          function (e, t, n) {
            ;(function (t) {
              function o(e, t) {
                var o = 'b' + n.packets[e.type] + e.data.data
                return t(o)
              }
              function r(e, t, o) {
                if (!t) return n.encodeBase64Packet(e, o)
                var r = e.data,
                  i = new Uint8Array(r),
                  s = new Uint8Array(1 + r.byteLength)
                s[0] = m[e.type]
                for (var a = 0; a < i.length; a++) s[a + 1] = i[a]
                return o(s.buffer)
              }
              function i(e, t, o) {
                if (!t) return n.encodeBase64Packet(e, o)
                var r = new FileReader()
                return (
                  (r.onload = function () {
                    ;(e.data = r.result), n.encodePacket(e, t, !0, o)
                  }),
                  r.readAsArrayBuffer(e.data)
                )
              }
              function s(e, t, o) {
                if (!t) return n.encodeBase64Packet(e, o)
                if (g) return i(e, t, o)
                var r = new Uint8Array(1)
                r[0] = m[e.type]
                var s = new k([r.buffer, e.data])
                return o(s)
              }
              function a(e, t, n) {
                for (
                  var o = new Array(e.length),
                    r = f(e.length, n),
                    i = function (e, n, r) {
                      t(n, function (t, n) {
                        ;(o[e] = n), r(t, o)
                      })
                    },
                    s = 0;
                  s < e.length;
                  s++
                )
                  i(s, e[s], r)
              }
              var c = e('./keys'),
                p = e('has-binary'),
                u = e('arraybuffer.slice'),
                h = e('base64-arraybuffer'),
                f = e('after'),
                l = e('utf8'),
                d = navigator.userAgent.match(/Android/i),
                y = /PhantomJS/i.test(navigator.userAgent),
                g = d || y
              n.protocol = 3
              var m = (n.packets = {
                  open: 0,
                  close: 1,
                  ping: 2,
                  pong: 3,
                  message: 4,
                  upgrade: 5,
                  noop: 6
                }),
                v = c(m),
                b = { type: 'error', data: 'parser error' },
                k = e('blob')
              ;(n.encodePacket = function (e, n, i, a) {
                'function' == typeof n && ((a = n), (n = !1)),
                  'function' == typeof i && ((a = i), (i = null))
                var c = void 0 === e.data ? void 0 : e.data.buffer || e.data
                if (t.ArrayBuffer && c instanceof ArrayBuffer) return r(e, n, a)
                if (k && c instanceof t.Blob) return s(e, n, a)
                if (c && c.base64) return o(e, a)
                var p = m[e.type]
                return (
                  void 0 !== e.data &&
                    (p += i ? l.encode(String(e.data)) : String(e.data)),
                  a('' + p)
                )
              }),
                (n.encodeBase64Packet = function (e, o) {
                  var r = 'b' + n.packets[e.type]
                  if (k && e.data instanceof t.Blob) {
                    var i = new FileReader()
                    return (
                      (i.onload = function () {
                        var e = i.result.split(',')[1]
                        o(r + e)
                      }),
                      i.readAsDataURL(e.data)
                    )
                  }
                  var s
                  try {
                    s = String.fromCharCode.apply(null, new Uint8Array(e.data))
                  } catch (a) {
                    for (
                      var c = new Uint8Array(e.data),
                        p = new Array(c.length),
                        u = 0;
                      u < c.length;
                      u++
                    )
                      p[u] = c[u]
                    s = String.fromCharCode.apply(null, p)
                  }
                  return (r += t.btoa(s)), o(r)
                }),
                (n.decodePacket = function (e, t, o) {
                  if ('string' == typeof e || void 0 === e) {
                    if ('b' == e.charAt(0))
                      return n.decodeBase64Packet(e.substr(1), t)
                    if (o)
                      try {
                        e = l.decode(e)
                      } catch (r) {
                        return b
                      }
                    var i = e.charAt(0)
                    return Number(i) == i && v[i]
                      ? e.length > 1
                        ? { type: v[i], data: e.substring(1) }
                        : { type: v[i] }
                      : b
                  }
                  var s = new Uint8Array(e),
                    i = s[0],
                    a = u(e, 1)
                  return (
                    k && 'blob' === t && (a = new k([a])),
                    { type: v[i], data: a }
                  )
                }),
                (n.decodeBase64Packet = function (e, n) {
                  var o = v[e.charAt(0)]
                  if (!t.ArrayBuffer)
                    return { type: o, data: { base64: !0, data: e.substr(1) } }
                  var r = h.decode(e.substr(1))
                  return (
                    'blob' === n && k && (r = new k([r])), { type: o, data: r }
                  )
                }),
                (n.encodePayload = function (e, t, o) {
                  function r(e) {
                    return e.length + ':' + e
                  }
                  function i(e, o) {
                    n.encodePacket(e, s ? t : !1, !0, function (e) {
                      o(null, r(e))
                    })
                  }
                  'function' == typeof t && ((o = t), (t = null))
                  var s = p(e)
                  return t && s
                    ? k && !g
                      ? n.encodePayloadAsBlob(e, o)
                      : n.encodePayloadAsArrayBuffer(e, o)
                    : e.length
                    ? void a(e, i, function (e, t) {
                        return o(t.join(''))
                      })
                    : o('0:')
                }),
                (n.decodePayload = function (e, t, o) {
                  if ('string' != typeof e)
                    return n.decodePayloadAsBinary(e, t, o)
                  'function' == typeof t && ((o = t), (t = null))
                  var r
                  if ('' == e) return o(b, 0, 1)
                  for (var i, s, a = '', c = 0, p = e.length; p > c; c++) {
                    var u = e.charAt(c)
                    if (':' != u) a += u
                    else {
                      if ('' == a || a != (i = Number(a))) return o(b, 0, 1)
                      if (((s = e.substr(c + 1, i)), a != s.length))
                        return o(b, 0, 1)
                      if (s.length) {
                        if (
                          ((r = n.decodePacket(s, t, !0)),
                          b.type == r.type && b.data == r.data)
                        )
                          return o(b, 0, 1)
                        var h = o(r, c + i, p)
                        if (!1 === h) return
                      }
                      ;(c += i), (a = '')
                    }
                  }
                  return '' != a ? o(b, 0, 1) : void 0
                }),
                (n.encodePayloadAsArrayBuffer = function (e, t) {
                  function o(e, t) {
                    n.encodePacket(e, !0, !0, function (e) {
                      return t(null, e)
                    })
                  }
                  return e.length
                    ? void a(e, o, function (e, n) {
                        var o = n.reduce(function (e, t) {
                            var n
                            return (
                              (n =
                                'string' == typeof t ? t.length : t.byteLength),
                              e + n.toString().length + n + 2
                            )
                          }, 0),
                          r = new Uint8Array(o),
                          i = 0
                        return (
                          n.forEach(function (e) {
                            var t = 'string' == typeof e,
                              n = e
                            if (t) {
                              for (
                                var o = new Uint8Array(e.length), s = 0;
                                s < e.length;
                                s++
                              )
                                o[s] = e.charCodeAt(s)
                              n = o.buffer
                            }
                            t ? (r[i++] = 0) : (r[i++] = 1)
                            for (
                              var a = n.byteLength.toString(), s = 0;
                              s < a.length;
                              s++
                            )
                              r[i++] = parseInt(a[s])
                            r[i++] = 255
                            for (
                              var o = new Uint8Array(n), s = 0;
                              s < o.length;
                              s++
                            )
                              r[i++] = o[s]
                          }),
                          t(r.buffer)
                        )
                      })
                    : t(new ArrayBuffer(0))
                }),
                (n.encodePayloadAsBlob = function (e, t) {
                  function o(e, t) {
                    n.encodePacket(e, !0, !0, function (e) {
                      var n = new Uint8Array(1)
                      if (((n[0] = 1), 'string' == typeof e)) {
                        for (
                          var o = new Uint8Array(e.length), r = 0;
                          r < e.length;
                          r++
                        )
                          o[r] = e.charCodeAt(r)
                        ;(e = o.buffer), (n[0] = 0)
                      }
                      for (
                        var i =
                            e instanceof ArrayBuffer ? e.byteLength : e.size,
                          s = i.toString(),
                          a = new Uint8Array(s.length + 1),
                          r = 0;
                        r < s.length;
                        r++
                      )
                        a[r] = parseInt(s[r])
                      if (((a[s.length] = 255), k)) {
                        var c = new k([n.buffer, a.buffer, e])
                        t(null, c)
                      }
                    })
                  }
                  a(e, o, function (e, n) {
                    return t(new k(n))
                  })
                }),
                (n.decodePayloadAsBinary = function (e, t, o) {
                  'function' == typeof t && ((o = t), (t = null))
                  for (var r = e, i = [], s = !1; r.byteLength > 0; ) {
                    for (
                      var a = new Uint8Array(r), c = 0 === a[0], p = '', h = 1;
                      255 != a[h];
                      h++
                    ) {
                      if (p.length > 310) {
                        s = !0
                        break
                      }
                      p += a[h]
                    }
                    if (s) return o(b, 0, 1)
                    ;(r = u(r, 2 + p.length)), (p = parseInt(p))
                    var f = u(r, 0, p)
                    if (c)
                      try {
                        f = String.fromCharCode.apply(null, new Uint8Array(f))
                      } catch (l) {
                        var d = new Uint8Array(f)
                        f = ''
                        for (var h = 0; h < d.length; h++)
                          f += String.fromCharCode(d[h])
                      }
                    i.push(f), (r = u(r, p))
                  }
                  var y = i.length
                  i.forEach(function (e, r) {
                    o(n.decodePacket(e, t, !0), r, y)
                  })
                })
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {
            './keys': 20,
            after: 11,
            'arraybuffer.slice': 12,
            'base64-arraybuffer': 13,
            blob: 14,
            'has-binary': 21,
            utf8: 29
          }
        ],
        20: [
          function (e, t, n) {
            t.exports =
              Object.keys ||
              function (e) {
                var t = [],
                  n = Object.prototype.hasOwnProperty
                for (var o in e) n.call(e, o) && t.push(o)
                return t
              }
          },
          {}
        ],
        21: [
          function (e, t, n) {
            ;(function (n) {
              function o(e) {
                function t(e) {
                  if (!e) return !1
                  if (
                    (n.Buffer && n.Buffer.isBuffer(e)) ||
                    (n.ArrayBuffer && e instanceof ArrayBuffer) ||
                    (n.Blob && e instanceof Blob) ||
                    (n.File && e instanceof File)
                  )
                    return !0
                  if (r(e)) {
                    for (var o = 0; o < e.length; o++) if (t(e[o])) return !0
                  } else if (e && 'object' == typeof e) {
                    e.toJSON && (e = e.toJSON())
                    for (var i in e)
                      if (Object.prototype.hasOwnProperty.call(e, i) && t(e[i]))
                        return !0
                  }
                  return !1
                }
                return t(e)
              }
              var r = e('isarray')
              t.exports = o
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          { isarray: 24 }
        ],
        22: [
          function (e, t, n) {
            try {
              t.exports =
                'undefined' != typeof XMLHttpRequest &&
                'withCredentials' in new XMLHttpRequest()
            } catch (o) {
              t.exports = !1
            }
          },
          {}
        ],
        23: [
          function (e, t, n) {
            var o = [].indexOf
            t.exports = function (e, t) {
              if (o) return e.indexOf(t)
              for (var n = 0; n < e.length; ++n) if (e[n] === t) return n
              return -1
            }
          },
          {}
        ],
        24: [
          function (e, t, n) {
            t.exports =
              Array.isArray ||
              function (e) {
                return '[object Array]' == Object.prototype.toString.call(e)
              }
          },
          {}
        ],
        25: [
          function (e, t, n) {
            function o(e) {
              if (((e = '' + e), !(e.length > 1e4))) {
                var t =
                  /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                    e
                  )
                if (t) {
                  var n = parseFloat(t[1]),
                    o = (t[2] || 'ms').toLowerCase()
                  switch (o) {
                    case 'years':
                    case 'year':
                    case 'yrs':
                    case 'yr':
                    case 'y':
                      return n * h
                    case 'days':
                    case 'day':
                    case 'd':
                      return n * u
                    case 'hours':
                    case 'hour':
                    case 'hrs':
                    case 'hr':
                    case 'h':
                      return n * p
                    case 'minutes':
                    case 'minute':
                    case 'mins':
                    case 'min':
                    case 'm':
                      return n * c
                    case 'seconds':
                    case 'second':
                    case 'secs':
                    case 'sec':
                    case 's':
                      return n * a
                    case 'milliseconds':
                    case 'millisecond':
                    case 'msecs':
                    case 'msec':
                    case 'ms':
                      return n
                  }
                }
              }
            }
            function r(e) {
              return e >= u
                ? Math.round(e / u) + 'd'
                : e >= p
                ? Math.round(e / p) + 'h'
                : e >= c
                ? Math.round(e / c) + 'm'
                : e >= a
                ? Math.round(e / a) + 's'
                : e + 'ms'
            }
            function i(e) {
              return (
                s(e, u, 'day') ||
                s(e, p, 'hour') ||
                s(e, c, 'minute') ||
                s(e, a, 'second') ||
                e + ' ms'
              )
            }
            function s(e, t, n) {
              return t > e
                ? void 0
                : 1.5 * t > e
                ? Math.floor(e / t) + ' ' + n
                : Math.ceil(e / t) + ' ' + n + 's'
            }
            var a = 1e3,
              c = 60 * a,
              p = 60 * c,
              u = 24 * p,
              h = 365.25 * u
            t.exports = function (e, t) {
              return (
                (t = t || {}),
                'string' == typeof e ? o(e) : t['long'] ? i(e) : r(e)
              )
            }
          },
          {}
        ],
        26: [
          function (e, t, n) {
            ;(function (e) {
              var n = /^[\],:{}\s]*$/,
                o = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                r =
                  /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                i = /(?:^|:|,)(?:\s*\[)+/g,
                s = /^\s+/,
                a = /\s+$/
              t.exports = function (t) {
                return 'string' == typeof t && t
                  ? ((t = t.replace(s, '').replace(a, '')),
                    e.JSON && JSON.parse
                      ? JSON.parse(t)
                      : n.test(t.replace(o, '@').replace(r, ']').replace(i, ''))
                      ? new Function('return ' + t)()
                      : void 0)
                  : null
              }
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {}
        ],
        27: [
          function (e, t, n) {
            ;(n.encode = function (e) {
              var t = ''
              for (var n in e)
                e.hasOwnProperty(n) &&
                  (t.length && (t += '&'),
                  (t += encodeURIComponent(n) + '=' + encodeURIComponent(e[n])))
              return t
            }),
              (n.decode = function (e) {
                for (
                  var t = {}, n = e.split('&'), o = 0, r = n.length;
                  r > o;
                  o++
                ) {
                  var i = n[o].split('=')
                  t[decodeURIComponent(i[0])] = decodeURIComponent(i[1])
                }
                return t
              })
          },
          {}
        ],
        28: [
          function (e, t, n) {
            var o =
                /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
              r = [
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
            t.exports = function (e) {
              var t = e,
                n = e.indexOf('['),
                i = e.indexOf(']')
              ;-1 != n &&
                -1 != i &&
                (e =
                  e.substring(0, n) +
                  e.substring(n, i).replace(/:/g, ';') +
                  e.substring(i, e.length))
              for (var s = o.exec(e || ''), a = {}, c = 14; c--; )
                a[r[c]] = s[c] || ''
              return (
                -1 != n &&
                  -1 != i &&
                  ((a.source = t),
                  (a.host = a.host
                    .substring(1, a.host.length - 1)
                    .replace(/;/g, ':')),
                  (a.authority = a.authority
                    .replace('[', '')
                    .replace(']', '')
                    .replace(/;/g, ':')),
                  (a.ipv6uri = !0)),
                a
              )
            }
          },
          {}
        ],
        29: [
          function (t, n, o) {
            ;(function (t) {
              !(function (r) {
                function i(e) {
                  for (var t, n, o = [], r = 0, i = e.length; i > r; )
                    (t = e.charCodeAt(r++)),
                      t >= 55296 && 56319 >= t && i > r
                        ? ((n = e.charCodeAt(r++)),
                          56320 == (64512 & n)
                            ? o.push(((1023 & t) << 10) + (1023 & n) + 65536)
                            : (o.push(t), r--))
                        : o.push(t)
                  return o
                }
                function s(e) {
                  for (var t, n = e.length, o = -1, r = ''; ++o < n; )
                    (t = e[o]),
                      t > 65535 &&
                        ((t -= 65536),
                        (r += k(((t >>> 10) & 1023) | 55296)),
                        (t = 56320 | (1023 & t))),
                      (r += k(t))
                  return r
                }
                function a(e) {
                  if (e >= 55296 && 57343 >= e)
                    throw Error(
                      'Lone surrogate U+' +
                        e.toString(16).toUpperCase() +
                        ' is not a scalar value'
                    )
                }
                function c(e, t) {
                  return k(((e >> t) & 63) | 128)
                }
                function p(e) {
                  if (0 == (4294967168 & e)) return k(e)
                  var t = ''
                  return (
                    0 == (4294965248 & e)
                      ? (t = k(((e >> 6) & 31) | 192))
                      : 0 == (4294901760 & e)
                      ? (a(e), (t = k(((e >> 12) & 15) | 224)), (t += c(e, 6)))
                      : 0 == (4292870144 & e) &&
                        ((t = k(((e >> 18) & 7) | 240)),
                        (t += c(e, 12)),
                        (t += c(e, 6))),
                    (t += k((63 & e) | 128))
                  )
                }
                function u(e) {
                  for (var t, n = i(e), o = n.length, r = -1, s = ''; ++r < o; )
                    (t = n[r]), (s += p(t))
                  return s
                }
                function h() {
                  if (b >= v) throw Error('Invalid byte index')
                  var e = 255 & m[b]
                  if ((b++, 128 == (192 & e))) return 63 & e
                  throw Error('Invalid continuation byte')
                }
                function f() {
                  var e, t, n, o, r
                  if (b > v) throw Error('Invalid byte index')
                  if (b == v) return !1
                  if (((e = 255 & m[b]), b++, 0 == (128 & e))) return e
                  if (192 == (224 & e)) {
                    var t = h()
                    if (((r = ((31 & e) << 6) | t), r >= 128)) return r
                    throw Error('Invalid continuation byte')
                  }
                  if (224 == (240 & e)) {
                    if (
                      ((t = h()),
                      (n = h()),
                      (r = ((15 & e) << 12) | (t << 6) | n),
                      r >= 2048)
                    )
                      return a(r), r
                    throw Error('Invalid continuation byte')
                  }
                  if (
                    240 == (248 & e) &&
                    ((t = h()),
                    (n = h()),
                    (o = h()),
                    (r = ((15 & e) << 18) | (t << 12) | (n << 6) | o),
                    r >= 65536 && 1114111 >= r)
                  )
                    return r
                  throw Error('Invalid UTF-8 detected')
                }
                function l(e) {
                  ;(m = i(e)), (v = m.length), (b = 0)
                  for (var t, n = []; (t = f()) !== !1; ) n.push(t)
                  return s(n)
                }
                var d = 'object' == typeof o && o,
                  y = 'object' == typeof n && n && n.exports == d && n,
                  g = 'object' == typeof t && t
                ;(g.global !== g && g.window !== g) || (r = g)
                var m,
                  v,
                  b,
                  k = String.fromCharCode,
                  w = { version: '2.0.0', encode: u, decode: l }
                if ('function' == typeof e && 'object' == typeof e.amd && e.amd)
                  e(function () {
                    return w
                  })
                else if (d && !d.nodeType)
                  if (y) y.exports = w
                  else {
                    var x = {},
                      C = x.hasOwnProperty
                    for (var A in w) C.call(w, A) && (d[A] = w[A])
                  }
                else r.utf8 = w
              })(this)
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {}
        ],
        30: [
          function (e, t, n) {
            'use strict'
            function o(e) {
              var t = ''
              do (t = a[e % c] + t), (e = Math.floor(e / c))
              while (e > 0)
              return t
            }
            function r(e) {
              var t = 0
              for (h = 0; h < e.length; h++) t = t * c + p[e.charAt(h)]
              return t
            }
            function i() {
              var e = o(+new Date())
              return e !== s ? ((u = 0), (s = e)) : e + '.' + o(u++)
            }
            for (
              var s,
                a =
                  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(
                    ''
                  ),
                c = 64,
                p = {},
                u = 0,
                h = 0;
              c > h;
              h++
            )
              p[a[h]] = h
            ;(i.encode = o), (i.decode = r), (t.exports = i)
          },
          {}
        ],
        31: [
          function (e, t, n) {
            function o(e, t) {
              'object' == typeof e && ((t = e), (e = void 0)), (t = t || {})
              var n,
                o = r(e),
                i = o.source,
                p = o.id,
                u = o.path,
                h = c[p] && u in c[p].nsps,
                f =
                  t.forceNew ||
                  t['force new connection'] ||
                  !1 === t.multiplex ||
                  h
              return (
                f
                  ? (a('ignoring socket cache for %s', i), (n = s(i, t)))
                  : (c[p] || (a('new io instance for %s', i), (c[p] = s(i, t))),
                    (n = c[p])),
                n.socket(o.path)
              )
            }
            var r = e('./url'),
              i = e('socket.io-parser'),
              s = e('./manager'),
              a = e('debug')('socket.io-client')
            t.exports = n = o
            var c = (n.managers = {})
            ;(n.protocol = i.protocol),
              (n.connect = o),
              (n.Manager = e('./manager')),
              (n.Socket = e('./socket'))
          },
          {
            './manager': 32,
            './socket': 34,
            './url': 35,
            debug: 39,
            'socket.io-parser': 47
          }
        ],
        32: [
          function (e, t, n) {
            function o(e, t) {
              return this instanceof o
                ? (e && 'object' == typeof e && ((t = e), (e = void 0)),
                  (t = t || {}),
                  (t.path = t.path || '/socket.io'),
                  (this.nsps = {}),
                  (this.subs = []),
                  (this.opts = t),
                  this.reconnection(t.reconnection !== !1),
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
                  (this.packetBuffer = []),
                  (this.encoder = new a.Encoder()),
                  (this.decoder = new a.Decoder()),
                  (this.autoConnect = t.autoConnect !== !1),
                  void (this.autoConnect && this.open()))
                : new o(e, t)
            }
            var r = e('engine.io-client'),
              i = e('./socket'),
              s = e('component-emitter'),
              a = e('socket.io-parser'),
              c = e('./on'),
              p = e('component-bind'),
              u = e('debug')('socket.io-client:manager'),
              h = e('indexof'),
              f = e('backo2'),
              l = Object.prototype.hasOwnProperty
            ;(t.exports = o),
              (o.prototype.emitAll = function () {
                this.emit.apply(this, arguments)
                for (var e in this.nsps)
                  l.call(this.nsps, e) &&
                    this.nsps[e].emit.apply(this.nsps[e], arguments)
              }),
              (o.prototype.updateSocketIds = function () {
                for (var e in this.nsps)
                  l.call(this.nsps, e) && (this.nsps[e].id = this.engine.id)
              }),
              s(o.prototype),
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
                function (e) {
                  if (
                    (u('readyState %s', this.readyState),
                    ~this.readyState.indexOf('open'))
                  )
                    return this
                  u('opening %s', this.uri),
                    (this.engine = r(this.uri, this.opts))
                  var t = this.engine,
                    n = this
                  ;(this.readyState = 'opening'), (this.skipReconnect = !1)
                  var o = c(t, 'open', function () {
                      n.onopen(), e && e()
                    }),
                    i = c(t, 'error', function (t) {
                      if (
                        (u('connect_error'),
                        n.cleanup(),
                        (n.readyState = 'closed'),
                        n.emitAll('connect_error', t),
                        e)
                      ) {
                        var o = new Error('Connection error')
                        ;(o.data = t), e(o)
                      } else n.maybeReconnectOnOpen()
                    })
                  if (!1 !== this._timeout) {
                    var s = this._timeout
                    u('connect attempt will timeout after %d', s)
                    var a = setTimeout(function () {
                      u('connect attempt timed out after %d', s),
                        o.destroy(),
                        t.close(),
                        t.emit('error', 'timeout'),
                        n.emitAll('connect_timeout', s)
                    }, s)
                    this.subs.push({
                      destroy: function () {
                        clearTimeout(a)
                      }
                    })
                  }
                  return this.subs.push(o), this.subs.push(i), this
                }),
              (o.prototype.onopen = function () {
                u('open'),
                  this.cleanup(),
                  (this.readyState = 'open'),
                  this.emit('open')
                var e = this.engine
                this.subs.push(c(e, 'data', p(this, 'ondata'))),
                  this.subs.push(c(e, 'ping', p(this, 'onping'))),
                  this.subs.push(c(e, 'pong', p(this, 'onpong'))),
                  this.subs.push(c(e, 'error', p(this, 'onerror'))),
                  this.subs.push(c(e, 'close', p(this, 'onclose'))),
                  this.subs.push(
                    c(this.decoder, 'decoded', p(this, 'ondecoded'))
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
              (o.prototype.socket = function (e) {
                function t() {
                  ~h(o.connecting, n) || o.connecting.push(n)
                }
                var n = this.nsps[e]
                if (!n) {
                  ;(n = new i(this, e)), (this.nsps[e] = n)
                  var o = this
                  n.on('connecting', t),
                    n.on('connect', function () {
                      n.id = o.engine.id
                    }),
                    this.autoConnect && t()
                }
                return n
              }),
              (o.prototype.destroy = function (e) {
                var t = h(this.connecting, e)
                ~t && this.connecting.splice(t, 1),
                  this.connecting.length || this.close()
              }),
              (o.prototype.packet = function (e) {
                u('writing packet %j', e)
                var t = this
                t.encoding
                  ? t.packetBuffer.push(e)
                  : ((t.encoding = !0),
                    this.encoder.encode(e, function (n) {
                      for (var o = 0; o < n.length; o++)
                        t.engine.write(n[o], e.options)
                      ;(t.encoding = !1), t.processPacketQueue()
                    }))
              }),
              (o.prototype.processPacketQueue = function () {
                if (this.packetBuffer.length > 0 && !this.encoding) {
                  var e = this.packetBuffer.shift()
                  this.packet(e)
                }
              }),
              (o.prototype.cleanup = function () {
                u('cleanup')
                for (var e; (e = this.subs.shift()); ) e.destroy()
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
                    'opening' == this.readyState && this.cleanup(),
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
                var e = this
                if (this.backoff.attempts >= this._reconnectionAttempts)
                  u('reconnect failed'),
                    this.backoff.reset(),
                    this.emitAll('reconnect_failed'),
                    (this.reconnecting = !1)
                else {
                  var t = this.backoff.duration()
                  u('will wait %dms before reconnect attempt', t),
                    (this.reconnecting = !0)
                  var n = setTimeout(function () {
                    e.skipReconnect ||
                      (u('attempting reconnect'),
                      e.emitAll('reconnect_attempt', e.backoff.attempts),
                      e.emitAll('reconnecting', e.backoff.attempts),
                      e.skipReconnect ||
                        e.open(function (t) {
                          t
                            ? (u('reconnect attempt error'),
                              (e.reconnecting = !1),
                              e.reconnect(),
                              e.emitAll('reconnect_error', t.data))
                            : (u('reconnect success'), e.onreconnect())
                        }))
                  }, t)
                  this.subs.push({
                    destroy: function () {
                      clearTimeout(n)
                    }
                  })
                }
              }),
              (o.prototype.onreconnect = function () {
                var e = this.backoff.attempts
                ;(this.reconnecting = !1),
                  this.backoff.reset(),
                  this.updateSocketIds(),
                  this.emitAll('reconnect', e)
              })
          },
          {
            './on': 33,
            './socket': 34,
            backo2: 36,
            'component-bind': 37,
            'component-emitter': 38,
            debug: 39,
            'engine.io-client': 1,
            indexof: 42,
            'socket.io-parser': 47
          }
        ],
        33: [
          function (e, t, n) {
            function o(e, t, n) {
              return (
                e.on(t, n),
                {
                  destroy: function () {
                    e.removeListener(t, n)
                  }
                }
              )
            }
            t.exports = o
          },
          {}
        ],
        34: [
          function (e, t, n) {
            function o(e, t) {
              ;(this.io = e),
                (this.nsp = t),
                (this.json = this),
                (this.ids = 0),
                (this.acks = {}),
                (this.receiveBuffer = []),
                (this.sendBuffer = []),
                (this.connected = !1),
                (this.disconnected = !0),
                this.io.autoConnect && this.open()
            }
            var r = e('socket.io-parser'),
              i = e('component-emitter'),
              s = e('to-array'),
              a = e('./on'),
              c = e('component-bind'),
              p = e('debug')('socket.io-client:socket'),
              u = e('has-binary')
            t.exports = n = o
            var h = {
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
              f = i.prototype.emit
            i(o.prototype),
              (o.prototype.subEvents = function () {
                if (!this.subs) {
                  var e = this.io
                  this.subs = [
                    a(e, 'open', c(this, 'onopen')),
                    a(e, 'packet', c(this, 'onpacket')),
                    a(e, 'close', c(this, 'onclose'))
                  ]
                }
              }),
              (o.prototype.open = o.prototype.connect =
                function () {
                  return this.connected
                    ? this
                    : (this.subEvents(),
                      this.io.open(),
                      'open' == this.io.readyState && this.onopen(),
                      this.emit('connecting'),
                      this)
                }),
              (o.prototype.send = function () {
                var e = s(arguments)
                return e.unshift('message'), this.emit.apply(this, e), this
              }),
              (o.prototype.emit = function (e) {
                if (h.hasOwnProperty(e)) return f.apply(this, arguments), this
                var t = s(arguments),
                  n = r.EVENT
                u(t) && (n = r.BINARY_EVENT)
                var o = { type: n, data: t }
                return (
                  (o.options = {}),
                  (o.options.compress =
                    !this.flags || !1 !== this.flags.compress),
                  'function' == typeof t[t.length - 1] &&
                    (p('emitting packet with ack id %d', this.ids),
                    (this.acks[this.ids] = t.pop()),
                    (o.id = this.ids++)),
                  this.connected ? this.packet(o) : this.sendBuffer.push(o),
                  delete this.flags,
                  this
                )
              }),
              (o.prototype.packet = function (e) {
                ;(e.nsp = this.nsp), this.io.packet(e)
              }),
              (o.prototype.onopen = function () {
                p('transport is open - connecting'),
                  '/' != this.nsp && this.packet({ type: r.CONNECT })
              }),
              (o.prototype.onclose = function (e) {
                p('close (%s)', e),
                  (this.connected = !1),
                  (this.disconnected = !0),
                  delete this.id,
                  this.emit('disconnect', e)
              }),
              (o.prototype.onpacket = function (e) {
                if (e.nsp == this.nsp)
                  switch (e.type) {
                    case r.CONNECT:
                      this.onconnect()
                      break
                    case r.EVENT:
                      this.onevent(e)
                      break
                    case r.BINARY_EVENT:
                      this.onevent(e)
                      break
                    case r.ACK:
                      this.onack(e)
                      break
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
                  this.connected ? f.apply(this, t) : this.receiveBuffer.push(t)
              }),
              (o.prototype.ack = function (e) {
                var t = this,
                  n = !1
                return function () {
                  if (!n) {
                    n = !0
                    var o = s(arguments)
                    p('sending ack %j', o)
                    var i = u(o) ? r.BINARY_ACK : r.ACK
                    t.packet({ type: i, id: e, data: o })
                  }
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
                var e
                for (e = 0; e < this.receiveBuffer.length; e++)
                  f.apply(this, this.receiveBuffer[e])
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
                return (
                  (this.flags = this.flags || {}),
                  (this.flags.compress = e),
                  this
                )
              })
          },
          {
            './on': 33,
            'component-bind': 37,
            'component-emitter': 38,
            debug: 39,
            'has-binary': 41,
            'socket.io-parser': 47,
            'to-array': 51
          }
        ],
        35: [
          function (e, t, n) {
            ;(function (n) {
              function o(e, t) {
                var o = e,
                  t = t || n.location
                null == e && (e = t.protocol + '//' + t.host),
                  'string' == typeof e &&
                    ('/' == e.charAt(0) &&
                      (e = '/' == e.charAt(1) ? t.protocol + e : t.host + e),
                    /^(https?|wss?):\/\//.test(e) ||
                      (i('protocol-less url %s', e),
                      (e =
                        'undefined' != typeof t
                          ? t.protocol + '//' + e
                          : 'https://' + e)),
                    i('parse %s', e),
                    (o = r(e))),
                  o.port ||
                    (/^(http|ws)$/.test(o.protocol)
                      ? (o.port = '80')
                      : /^(http|ws)s$/.test(o.protocol) && (o.port = '443')),
                  (o.path = o.path || '/')
                var s = -1 !== o.host.indexOf(':'),
                  a = s ? '[' + o.host + ']' : o.host
                return (
                  (o.id = o.protocol + '://' + a + ':' + o.port),
                  (o.href =
                    o.protocol +
                    '://' +
                    a +
                    (t && t.port == o.port ? '' : ':' + o.port)),
                  o
                )
              }
              var r = e('parseuri'),
                i = e('debug')('socket.io-client:url')
              t.exports = o
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          { debug: 39, parseuri: 45 }
        ],
        36: [
          function (e, t, n) {
            function o(e) {
              ;(e = e || {}),
                (this.ms = e.min || 100),
                (this.max = e.max || 1e4),
                (this.factor = e.factor || 2),
                (this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0),
                (this.attempts = 0)
            }
            ;(t.exports = o),
              (o.prototype.duration = function () {
                var e = this.ms * Math.pow(this.factor, this.attempts++)
                if (this.jitter) {
                  var t = Math.random(),
                    n = Math.floor(t * this.jitter * e)
                  e = 0 == (1 & Math.floor(10 * t)) ? e - n : e + n
                }
                return 0 | Math.min(e, this.max)
              }),
              (o.prototype.reset = function () {
                this.attempts = 0
              }),
              (o.prototype.setMin = function (e) {
                this.ms = e
              }),
              (o.prototype.setMax = function (e) {
                this.max = e
              }),
              (o.prototype.setJitter = function (e) {
                this.jitter = e
              })
          },
          {}
        ],
        37: [
          function (e, t, n) {
            var o = [].slice
            t.exports = function (e, t) {
              if (('string' == typeof t && (t = e[t]), 'function' != typeof t))
                throw new Error('bind() requires a function')
              var n = o.call(arguments, 2)
              return function () {
                return t.apply(e, n.concat(o.call(arguments)))
              }
            }
          },
          {}
        ],
        38: [
          function (e, t, n) {
            function o(e) {
              return e ? r(e) : void 0
            }
            function r(e) {
              for (var t in o.prototype) e[t] = o.prototype[t]
              return e
            }
            ;(t.exports = o),
              (o.prototype.on = o.prototype.addEventListener =
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
                      if (((o = n[r]), o === t || o.fn === t)) {
                        n.splice(r, 1)
                        break
                      }
                    return this
                  }),
              (o.prototype.emit = function (e) {
                this._callbacks = this._callbacks || {}
                var t = [].slice.call(arguments, 1),
                  n = this._callbacks['$' + e]
                if (n) {
                  n = n.slice(0)
                  for (var o = 0, r = n.length; r > o; ++o) n[o].apply(this, t)
                }
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
          {}
        ],
        39: [
          function (e, t, n) {
            arguments[4][17][0].apply(n, arguments)
          },
          { './debug': 40, dup: 17 }
        ],
        40: [
          function (e, t, n) {
            arguments[4][18][0].apply(n, arguments)
          },
          { dup: 18, ms: 44 }
        ],
        41: [
          function (e, t, n) {
            ;(function (n) {
              function o(e) {
                function t(e) {
                  if (!e) return !1
                  if (
                    (n.Buffer && n.Buffer.isBuffer && n.Buffer.isBuffer(e)) ||
                    (n.ArrayBuffer && e instanceof ArrayBuffer) ||
                    (n.Blob && e instanceof Blob) ||
                    (n.File && e instanceof File)
                  )
                    return !0
                  if (r(e)) {
                    for (var o = 0; o < e.length; o++) if (t(e[o])) return !0
                  } else if (e && 'object' == typeof e) {
                    e.toJSON &&
                      'function' == typeof e.toJSON &&
                      (e = e.toJSON())
                    for (var i in e)
                      if (Object.prototype.hasOwnProperty.call(e, i) && t(e[i]))
                        return !0
                  }
                  return !1
                }
                return t(e)
              }
              var r = e('isarray')
              t.exports = o
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          { isarray: 43 }
        ],
        42: [
          function (e, t, n) {
            arguments[4][23][0].apply(n, arguments)
          },
          { dup: 23 }
        ],
        43: [
          function (e, t, n) {
            arguments[4][24][0].apply(n, arguments)
          },
          { dup: 24 }
        ],
        44: [
          function (e, t, n) {
            arguments[4][25][0].apply(n, arguments)
          },
          { dup: 25 }
        ],
        45: [
          function (e, t, n) {
            arguments[4][28][0].apply(n, arguments)
          },
          { dup: 28 }
        ],
        46: [
          function (e, t, n) {
            ;(function (t) {
              var o = e('isarray'),
                r = e('./is-buffer')
              ;(n.deconstructPacket = function (e) {
                function t(e) {
                  if (!e) return e
                  if (r(e)) {
                    var i = { _placeholder: !0, num: n.length }
                    return n.push(e), i
                  }
                  if (o(e)) {
                    for (var s = new Array(e.length), a = 0; a < e.length; a++)
                      s[a] = t(e[a])
                    return s
                  }
                  if ('object' == typeof e && !(e instanceof Date)) {
                    var s = {}
                    for (var c in e) s[c] = t(e[c])
                    return s
                  }
                  return e
                }
                var n = [],
                  i = e.data,
                  s = e
                return (
                  (s.data = t(i)),
                  (s.attachments = n.length),
                  { packet: s, buffers: n }
                )
              }),
                (n.reconstructPacket = function (e, t) {
                  function n(e) {
                    if (e && e._placeholder) {
                      var r = t[e.num]
                      return r
                    }
                    if (o(e)) {
                      for (var i = 0; i < e.length; i++) e[i] = n(e[i])
                      return e
                    }
                    if (e && 'object' == typeof e) {
                      for (var s in e) e[s] = n(e[s])
                      return e
                    }
                    return e
                  }
                  return (e.data = n(e.data)), (e.attachments = void 0), e
                }),
                (n.removeBlobs = function (e, n) {
                  function i(e, c, p) {
                    if (!e) return e
                    if (
                      (t.Blob && e instanceof Blob) ||
                      (t.File && e instanceof File)
                    ) {
                      s++
                      var u = new FileReader()
                      ;(u.onload = function () {
                        p ? (p[c] = this.result) : (a = this.result),
                          --s || n(a)
                      }),
                        u.readAsArrayBuffer(e)
                    } else if (o(e))
                      for (var h = 0; h < e.length; h++) i(e[h], h, e)
                    else if (e && 'object' == typeof e && !r(e))
                      for (var f in e) i(e[f], f, e)
                  }
                  var s = 0,
                    a = e
                  i(a), s || n(a)
                })
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          { './is-buffer': 48, isarray: 43 }
        ],
        47: [
          function (e, t, n) {
            function o() {}
            function r(e) {
              var t = '',
                o = !1
              return (
                (t += e.type),
                (n.BINARY_EVENT != e.type && n.BINARY_ACK != e.type) ||
                  ((t += e.attachments), (t += '-')),
                e.nsp && '/' != e.nsp && ((o = !0), (t += e.nsp)),
                null != e.id && (o && ((t += ','), (o = !1)), (t += e.id)),
                null != e.data && (o && (t += ','), (t += h.stringify(e.data))),
                u('encoded %j as %s', e, t),
                t
              )
            }
            function i(e, t) {
              function n(e) {
                var n = l.deconstructPacket(e),
                  o = r(n.packet),
                  i = n.buffers
                i.unshift(o), t(i)
              }
              l.removeBlobs(e, n)
            }
            function s() {
              this.reconstructor = null
            }
            function a(e) {
              var t = {},
                o = 0
              if (((t.type = Number(e.charAt(0))), null == n.types[t.type]))
                return p()
              if (n.BINARY_EVENT == t.type || n.BINARY_ACK == t.type) {
                for (
                  var r = '';
                  '-' != e.charAt(++o) && ((r += e.charAt(o)), o != e.length);

                );
                if (r != Number(r) || '-' != e.charAt(o))
                  throw new Error('Illegal attachments')
                t.attachments = Number(r)
              }
              if ('/' == e.charAt(o + 1))
                for (t.nsp = ''; ++o; ) {
                  var i = e.charAt(o)
                  if (',' == i) break
                  if (((t.nsp += i), o == e.length)) break
                }
              else t.nsp = '/'
              var s = e.charAt(o + 1)
              if ('' !== s && Number(s) == s) {
                for (t.id = ''; ++o; ) {
                  var i = e.charAt(o)
                  if (null == i || Number(i) != i) {
                    --o
                    break
                  }
                  if (((t.id += e.charAt(o)), o == e.length)) break
                }
                t.id = Number(t.id)
              }
              if (e.charAt(++o))
                try {
                  t.data = h.parse(e.substr(o))
                } catch (a) {
                  return p()
                }
              return u('decoded %s as %j', e, t), t
            }
            function c(e) {
              ;(this.reconPack = e), (this.buffers = [])
            }
            function p(e) {
              return { type: n.ERROR, data: 'parser error' }
            }
            var u = e('debug')('socket.io-parser'),
              h = e('json3'),
              f = (e('isarray'), e('component-emitter')),
              l = e('./binary'),
              d = e('./is-buffer')
            ;(n.protocol = 4),
              (n.types = [
                'CONNECT',
                'DISCONNECT',
                'EVENT',
                'BINARY_EVENT',
                'ACK',
                'BINARY_ACK',
                'ERROR'
              ]),
              (n.CONNECT = 0),
              (n.DISCONNECT = 1),
              (n.EVENT = 2),
              (n.ACK = 3),
              (n.ERROR = 4),
              (n.BINARY_EVENT = 5),
              (n.BINARY_ACK = 6),
              (n.Encoder = o),
              (n.Decoder = s),
              (o.prototype.encode = function (e, t) {
                if (
                  (u('encoding packet %j', e),
                  n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type)
                )
                  i(e, t)
                else {
                  var o = r(e)
                  t([o])
                }
              }),
              f(s.prototype),
              (s.prototype.add = function (e) {
                var t
                if ('string' == typeof e)
                  (t = a(e)),
                    n.BINARY_EVENT == t.type || n.BINARY_ACK == t.type
                      ? ((this.reconstructor = new c(t)),
                        0 === this.reconstructor.reconPack.attachments &&
                          this.emit('decoded', t))
                      : this.emit('decoded', t)
                else {
                  if (!d(e) && !e.base64) throw new Error('Unknown type: ' + e)
                  if (!this.reconstructor)
                    throw new Error(
                      'got binary data when not reconstructing a packet'
                    )
                  ;(t = this.reconstructor.takeBinaryData(e)),
                    t && ((this.reconstructor = null), this.emit('decoded', t))
                }
              }),
              (s.prototype.destroy = function () {
                this.reconstructor &&
                  this.reconstructor.finishedReconstruction()
              }),
              (c.prototype.takeBinaryData = function (e) {
                if (
                  (this.buffers.push(e),
                  this.buffers.length == this.reconPack.attachments)
                ) {
                  var t = l.reconstructPacket(this.reconPack, this.buffers)
                  return this.finishedReconstruction(), t
                }
                return null
              }),
              (c.prototype.finishedReconstruction = function () {
                ;(this.reconPack = null), (this.buffers = [])
              })
          },
          {
            './binary': 46,
            './is-buffer': 48,
            'component-emitter': 49,
            debug: 39,
            isarray: 43,
            json3: 50
          }
        ],
        48: [
          function (e, t, n) {
            ;(function (e) {
              function n(t) {
                return (
                  (e.Buffer && e.Buffer.isBuffer(t)) ||
                  (e.ArrayBuffer && t instanceof ArrayBuffer)
                )
              }
              t.exports = n
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {}
        ],
        49: [
          function (e, t, n) {
            arguments[4][15][0].apply(n, arguments)
          },
          { dup: 15 }
        ],
        50: [
          function (t, n, o) {
            ;(function (t) {
              ;(function () {
                function r(e, t) {
                  function n(e) {
                    if (n[e] !== g) return n[e]
                    var r
                    if ('bug-string-char-index' == e) r = 'a' != 'a'[0]
                    else if ('json' == e)
                      r = n('json-stringify') && n('json-parse')
                    else {
                      var s,
                        a = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'
                      if ('json-stringify' == e) {
                        var c = t.stringify,
                          u = 'function' == typeof c && b
                        if (u) {
                          ;(s = function () {
                            return 1
                          }).toJSON = s
                          try {
                            u =
                              '0' === c(0) &&
                              '0' === c(new o()) &&
                              '""' == c(new i()) &&
                              c(v) === g &&
                              c(g) === g &&
                              c() === g &&
                              '1' === c(s) &&
                              '[1]' == c([s]) &&
                              '[null]' == c([g]) &&
                              'null' == c(null) &&
                              '[null,null,null]' == c([g, v, null]) &&
                              c({ a: [s, !0, !1, null, '\x00\b\n\f\r	'] }) ==
                                a &&
                              '1' === c(null, s) &&
                              '[\n 1,\n 2\n]' == c([1, 2], null, 1) &&
                              '"-271821-04-20T00:00:00.000Z"' ==
                                c(new p(-864e13)) &&
                              '"+275760-09-13T00:00:00.000Z"' ==
                                c(new p(864e13)) &&
                              '"-000001-01-01T00:00:00.000Z"' ==
                                c(new p(-621987552e5)) &&
                              '"1969-12-31T23:59:59.999Z"' == c(new p(-1))
                          } catch (h) {
                            u = !1
                          }
                        }
                        r = u
                      }
                      if ('json-parse' == e) {
                        var f = t.parse
                        if ('function' == typeof f)
                          try {
                            if (0 === f('0') && !f(!1)) {
                              s = f(a)
                              var l = 5 == s.a.length && 1 === s.a[0]
                              if (l) {
                                try {
                                  l = !f('"	"')
                                } catch (h) {}
                                if (l)
                                  try {
                                    l = 1 !== f('01')
                                  } catch (h) {}
                                if (l)
                                  try {
                                    l = 1 !== f('1.')
                                  } catch (h) {}
                              }
                            }
                          } catch (h) {
                            l = !1
                          }
                        r = l
                      }
                    }
                    return (n[e] = !!r)
                  }
                  e || (e = c.Object()), t || (t = c.Object())
                  var o = e.Number || c.Number,
                    i = e.String || c.String,
                    a = e.Object || c.Object,
                    p = e.Date || c.Date,
                    u = e.SyntaxError || c.SyntaxError,
                    h = e.TypeError || c.TypeError,
                    f = e.Math || c.Math,
                    l = e.JSON || c.JSON
                  'object' == typeof l &&
                    l &&
                    ((t.stringify = l.stringify), (t.parse = l.parse))
                  var d,
                    y,
                    g,
                    m = a.prototype,
                    v = m.toString,
                    b = new p(-0xc782b5b800cec)
                  try {
                    b =
                      -109252 == b.getUTCFullYear() &&
                      0 === b.getUTCMonth() &&
                      1 === b.getUTCDate() &&
                      10 == b.getUTCHours() &&
                      37 == b.getUTCMinutes() &&
                      6 == b.getUTCSeconds() &&
                      708 == b.getUTCMilliseconds()
                  } catch (k) {}
                  if (!n('json')) {
                    var w = '[object Function]',
                      x = '[object Date]',
                      C = '[object Number]',
                      A = '[object String]',
                      _ = '[object Array]',
                      S = '[object Boolean]',
                      P = n('bug-string-char-index')
                    if (!b)
                      var B = f.floor,
                        T = [
                          0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334
                        ],
                        O = function (e, t) {
                          return (
                            T[t] +
                            365 * (e - 1970) +
                            B((e - 1969 + (t = +(t > 1))) / 4) -
                            B((e - 1901 + t) / 100) +
                            B((e - 1601 + t) / 400)
                          )
                        }
                    if (
                      ((d = m.hasOwnProperty) ||
                        (d = function (e) {
                          var t,
                            n = {}
                          return (
                            ((n.__proto__ = null),
                            (n.__proto__ = { toString: 1 }),
                            n).toString != v
                              ? (d = function (e) {
                                  var t = this.__proto__,
                                    n = e in ((this.__proto__ = null), this)
                                  return (this.__proto__ = t), n
                                })
                              : ((t = n.constructor),
                                (d = function (e) {
                                  var n = (this.constructor || t).prototype
                                  return (
                                    e in this && !(e in n && this[e] === n[e])
                                  )
                                })),
                            (n = null),
                            d.call(this, e)
                          )
                        }),
                      (y = function (e, t) {
                        var n,
                          o,
                          r,
                          i = 0
                        ;((n = function () {
                          this.valueOf = 0
                        }).prototype.valueOf = 0),
                          (o = new n())
                        for (r in o) d.call(o, r) && i++
                        return (
                          (n = o = null),
                          i
                            ? (y =
                                2 == i
                                  ? function (e, t) {
                                      var n,
                                        o = {},
                                        r = v.call(e) == w
                                      for (n in e)
                                        (r && 'prototype' == n) ||
                                          d.call(o, n) ||
                                          !(o[n] = 1) ||
                                          !d.call(e, n) ||
                                          t(n)
                                    }
                                  : function (e, t) {
                                      var n,
                                        o,
                                        r = v.call(e) == w
                                      for (n in e)
                                        (r && 'prototype' == n) ||
                                          !d.call(e, n) ||
                                          (o = 'constructor' === n) ||
                                          t(n)
                                      ;(o || d.call(e, (n = 'constructor'))) &&
                                        t(n)
                                    })
                            : ((o = [
                                'valueOf',
                                'toString',
                                'toLocaleString',
                                'propertyIsEnumerable',
                                'isPrototypeOf',
                                'hasOwnProperty',
                                'constructor'
                              ]),
                              (y = function (e, t) {
                                var n,
                                  r,
                                  i = v.call(e) == w,
                                  a =
                                    (!i &&
                                      'function' != typeof e.constructor &&
                                      s[typeof e.hasOwnProperty] &&
                                      e.hasOwnProperty) ||
                                    d
                                for (n in e)
                                  (i && 'prototype' == n) ||
                                    !a.call(e, n) ||
                                    t(n)
                                for (
                                  r = o.length;
                                  (n = o[--r]);
                                  a.call(e, n) && t(n)
                                );
                              })),
                          y(e, t)
                        )
                      }),
                      !n('json-stringify'))
                    ) {
                      var D = {
                          92: '\\\\',
                          34: '\\"',
                          8: '\\b',
                          12: '\\f',
                          10: '\\n',
                          13: '\\r',
                          9: '\\t'
                        },
                        R = '000000',
                        N = function (e, t) {
                          return (R + (t || 0)).slice(-e)
                        },
                        E = '\\u00',
                        j = function (e) {
                          for (
                            var t = '"',
                              n = 0,
                              o = e.length,
                              r = !P || o > 10,
                              i = r && (P ? e.split('') : e);
                            o > n;
                            n++
                          ) {
                            var s = e.charCodeAt(n)
                            switch (s) {
                              case 8:
                              case 9:
                              case 10:
                              case 12:
                              case 13:
                              case 34:
                              case 92:
                                t += D[s]
                                break
                              default:
                                if (32 > s) {
                                  t += E + N(2, s.toString(16))
                                  break
                                }
                                t += r ? i[n] : e.charAt(n)
                            }
                          }
                          return t + '"'
                        },
                        U = function (e, t, n, o, r, i, s) {
                          var a, c, p, u, f, l, m, b, k, w, P, T, D, R, E, I
                          try {
                            a = t[e]
                          } catch (q) {}
                          if ('object' == typeof a && a)
                            if (
                              ((c = v.call(a)), c != x || d.call(a, 'toJSON'))
                            )
                              'function' == typeof a.toJSON &&
                                ((c != C && c != A && c != _) ||
                                  d.call(a, 'toJSON')) &&
                                (a = a.toJSON(e))
                            else if (a > -1 / 0 && 1 / 0 > a) {
                              if (O) {
                                for (
                                  f = B(a / 864e5),
                                    p = B(f / 365.2425) + 1970 - 1;
                                  O(p + 1, 0) <= f;
                                  p++
                                );
                                for (
                                  u = B((f - O(p, 0)) / 30.42);
                                  O(p, u + 1) <= f;
                                  u++
                                );
                                ;(f = 1 + f - O(p, u)),
                                  (l = ((a % 864e5) + 864e5) % 864e5),
                                  (m = B(l / 36e5) % 24),
                                  (b = B(l / 6e4) % 60),
                                  (k = B(l / 1e3) % 60),
                                  (w = l % 1e3)
                              } else
                                (p = a.getUTCFullYear()),
                                  (u = a.getUTCMonth()),
                                  (f = a.getUTCDate()),
                                  (m = a.getUTCHours()),
                                  (b = a.getUTCMinutes()),
                                  (k = a.getUTCSeconds()),
                                  (w = a.getUTCMilliseconds())
                              a =
                                (0 >= p || p >= 1e4
                                  ? (0 > p ? '-' : '+') + N(6, 0 > p ? -p : p)
                                  : N(4, p)) +
                                '-' +
                                N(2, u + 1) +
                                '-' +
                                N(2, f) +
                                'T' +
                                N(2, m) +
                                ':' +
                                N(2, b) +
                                ':' +
                                N(2, k) +
                                '.' +
                                N(3, w) +
                                'Z'
                            } else a = null
                          if ((n && (a = n.call(t, e, a)), null === a))
                            return 'null'
                          if (((c = v.call(a)), c == S)) return '' + a
                          if (c == C)
                            return a > -1 / 0 && 1 / 0 > a ? '' + a : 'null'
                          if (c == A) return j('' + a)
                          if ('object' == typeof a) {
                            for (R = s.length; R--; ) if (s[R] === a) throw h()
                            if (
                              (s.push(a), (P = []), (E = i), (i += r), c == _)
                            ) {
                              for (D = 0, R = a.length; R > D; D++)
                                (T = U(D, a, n, o, r, i, s)),
                                  P.push(T === g ? 'null' : T)
                              I = P.length
                                ? r
                                  ? '[\n' +
                                    i +
                                    P.join(',\n' + i) +
                                    '\n' +
                                    E +
                                    ']'
                                  : '[' + P.join(',') + ']'
                                : '[]'
                            } else
                              y(o || a, function (e) {
                                var t = U(e, a, n, o, r, i, s)
                                t !== g &&
                                  P.push(j(e) + ':' + (r ? ' ' : '') + t)
                              }),
                                (I = P.length
                                  ? r
                                    ? '{\n' +
                                      i +
                                      P.join(',\n' + i) +
                                      '\n' +
                                      E +
                                      '}'
                                    : '{' + P.join(',') + '}'
                                  : '{}')
                            return s.pop(), I
                          }
                        }
                      t.stringify = function (e, t, n) {
                        var o, r, i, a
                        if (s[typeof t] && t)
                          if ((a = v.call(t)) == w) r = t
                          else if (a == _) {
                            i = {}
                            for (
                              var c, p = 0, u = t.length;
                              u > p;
                              c = t[p++],
                                a = v.call(c),
                                (a == A || a == C) && (i[c] = 1)
                            );
                          }
                        if (n)
                          if ((a = v.call(n)) == C) {
                            if ((n -= n % 1) > 0)
                              for (
                                o = '', n > 10 && (n = 10);
                                o.length < n;
                                o += ' '
                              );
                          } else
                            a == A && (o = n.length <= 10 ? n : n.slice(0, 10))
                        return U(
                          '',
                          ((c = {}), (c[''] = e), c),
                          r,
                          i,
                          o,
                          '',
                          []
                        )
                      }
                    }
                    if (!n('json-parse')) {
                      var I,
                        q,
                        L = i.fromCharCode,
                        M = {
                          92: '\\',
                          34: '"',
                          47: '/',
                          98: '\b',
                          116: '	',
                          110: '\n',
                          102: '\f',
                          114: '\r'
                        },
                        H = function () {
                          throw ((I = q = null), u())
                        },
                        F = function () {
                          for (var e, t, n, o, r, i = q, s = i.length; s > I; )
                            switch ((r = i.charCodeAt(I))) {
                              case 9:
                              case 10:
                              case 13:
                              case 32:
                                I++
                                break
                              case 123:
                              case 125:
                              case 91:
                              case 93:
                              case 58:
                              case 44:
                                return (e = P ? i.charAt(I) : i[I]), I++, e
                              case 34:
                                for (e = '@', I++; s > I; )
                                  if (((r = i.charCodeAt(I)), 32 > r)) H()
                                  else if (92 == r)
                                    switch ((r = i.charCodeAt(++I))) {
                                      case 92:
                                      case 34:
                                      case 47:
                                      case 98:
                                      case 116:
                                      case 110:
                                      case 102:
                                      case 114:
                                        ;(e += M[r]), I++
                                        break
                                      case 117:
                                        for (t = ++I, n = I + 4; n > I; I++)
                                          (r = i.charCodeAt(I)),
                                            (r >= 48 && 57 >= r) ||
                                              (r >= 97 && 102 >= r) ||
                                              (r >= 65 && 70 >= r) ||
                                              H()
                                        e += L('0x' + i.slice(t, I))
                                        break
                                      default:
                                        H()
                                    }
                                  else {
                                    if (34 == r) break
                                    for (
                                      r = i.charCodeAt(I), t = I;
                                      r >= 32 && 92 != r && 34 != r;

                                    )
                                      r = i.charCodeAt(++I)
                                    e += i.slice(t, I)
                                  }
                                if (34 == i.charCodeAt(I)) return I++, e
                                H()
                              default:
                                if (
                                  ((t = I),
                                  45 == r &&
                                    ((o = !0), (r = i.charCodeAt(++I))),
                                  r >= 48 && 57 >= r)
                                ) {
                                  for (
                                    48 == r &&
                                      ((r = i.charCodeAt(I + 1)),
                                      r >= 48 && 57 >= r) &&
                                      H(),
                                      o = !1;
                                    s > I &&
                                    ((r = i.charCodeAt(I)), r >= 48 && 57 >= r);
                                    I++
                                  );
                                  if (46 == i.charCodeAt(I)) {
                                    for (
                                      n = ++I;
                                      s > n &&
                                      ((r = i.charCodeAt(n)),
                                      r >= 48 && 57 >= r);
                                      n++
                                    );
                                    n == I && H(), (I = n)
                                  }
                                  if (
                                    ((r = i.charCodeAt(I)), 101 == r || 69 == r)
                                  ) {
                                    for (
                                      r = i.charCodeAt(++I),
                                        (43 != r && 45 != r) || I++,
                                        n = I;
                                      s > n &&
                                      ((r = i.charCodeAt(n)),
                                      r >= 48 && 57 >= r);
                                      n++
                                    );
                                    n == I && H(), (I = n)
                                  }
                                  return +i.slice(t, I)
                                }
                                if ((o && H(), 'true' == i.slice(I, I + 4)))
                                  return (I += 4), !0
                                if ('false' == i.slice(I, I + 5))
                                  return (I += 5), !1
                                if ('null' == i.slice(I, I + 4))
                                  return (I += 4), null
                                H()
                            }
                          return '$'
                        },
                        J = function (e) {
                          var t, n
                          if (('$' == e && H(), 'string' == typeof e)) {
                            if ('@' == (P ? e.charAt(0) : e[0]))
                              return e.slice(1)
                            if ('[' == e) {
                              for (t = []; (e = F()), ']' != e; n || (n = !0))
                                n &&
                                  (',' == e
                                    ? ((e = F()), ']' == e && H())
                                    : H()),
                                  ',' == e && H(),
                                  t.push(J(e))
                              return t
                            }
                            if ('{' == e) {
                              for (t = {}; (e = F()), '}' != e; n || (n = !0))
                                n &&
                                  (',' == e
                                    ? ((e = F()), '}' == e && H())
                                    : H()),
                                  (',' != e &&
                                    'string' == typeof e &&
                                    '@' == (P ? e.charAt(0) : e[0]) &&
                                    ':' == F()) ||
                                    H(),
                                  (t[e.slice(1)] = J(F()))
                              return t
                            }
                            H()
                          }
                          return e
                        },
                        z = function (e, t, n) {
                          var o = V(e, t, n)
                          o === g ? delete e[t] : (e[t] = o)
                        },
                        V = function (e, t, n) {
                          var o,
                            r = e[t]
                          if ('object' == typeof r && r)
                            if (v.call(r) == _)
                              for (o = r.length; o--; ) z(r, o, n)
                            else
                              y(r, function (e) {
                                z(r, e, n)
                              })
                          return n.call(e, t, r)
                        }
                      t.parse = function (e, t) {
                        var n, o
                        return (
                          (I = 0),
                          (q = '' + e),
                          (n = J(F())),
                          '$' != F() && H(),
                          (I = q = null),
                          t && v.call(t) == w
                            ? V(((o = {}), (o[''] = n), o), '', t)
                            : n
                        )
                      }
                    }
                  }
                  return (t.runInContext = r), t
                }
                var i = 'function' == typeof e && e.amd,
                  s = { function: !0, object: !0 },
                  a = s[typeof o] && o && !o.nodeType && o,
                  c = (s[typeof window] && window) || this,
                  p =
                    a &&
                    s[typeof n] &&
                    n &&
                    !n.nodeType &&
                    'object' == typeof t &&
                    t
                if (
                  (!p ||
                    (p.global !== p && p.window !== p && p.self !== p) ||
                    (c = p),
                  a && !i)
                )
                  r(c, a)
                else {
                  var u = c.JSON,
                    h = c.JSON3,
                    f = !1,
                    l = r(
                      c,
                      (c.JSON3 = {
                        noConflict: function () {
                          return (
                            f ||
                              ((f = !0),
                              (c.JSON = u),
                              (c.JSON3 = h),
                              (u = h = null)),
                            l
                          )
                        }
                      })
                    )
                  c.JSON = { parse: l.parse, stringify: l.stringify }
                }
                i &&
                  e(function () {
                    return l
                  })
              }).call(this)
            }).call(
              this,
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : {}
            )
          },
          {}
        ],
        51: [
          function (e, t, n) {
            function o(e, t) {
              var n = []
              t = t || 0
              for (var o = t || 0; o < e.length; o++) n[o - t] = e[o]
              return n
            }
            t.exports = o
          },
          {}
        ]
      },
      {},
      [31]
    )(31)
  })
