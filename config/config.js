require('dotenv').config();

module.exports = {
  // Telebirr Configuration
  telebirr: {
    baseUrl: process.env.TELEBIRR_BASE_URL || "https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway",
    fabricAppId: process.env.TELEBIRR_FABRIC_APP_ID || "c4182ef8-9249-458a-985e-06d191f4d505",
    appSecret: process.env.TELEBIRR_APP_SECRET || "fad0f06383c6297f545876694b974599",
    merchantAppId: process.env.TELEBIRR_MERCHANT_APP_ID || "1270036784844802",
    merchantCode: process.env.TELEBIRR_MERCHANT_CODE || "23942",
    privateKey: process.env.TELEBIRR_PRIVATE_KEY || `
      -----BEGIN PRIVATE KEY-----
      MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/ZcoOng1sJZ4C
      egopQVCw3HYqqVRLEudgT+dDpS8fRVy7zBgqZunju2VRCQuHeWs7yWgc9QGd4/8k
      RSLY+jlvKNeZ60yWcqEY+eKyQMmcjOz2Sn41fcVNgF+HV3DGiV4b23B6BCMjnpEF
      Ib9d99/TsjsFSc7gCPgfl2yWDxE/Y1B2tVE6op2qd63YsMVFQGdre/CQYvFJENpQ
      aBLMq4hHyBDgluUXlF0uA1X7UM0ZjbFC6ZIB/Hn1+pl5Ua8dKYrkVaecolmJT/s7
      c/+/1JeN+ja8luBoONsoODt2mTeVJHLF9Y3oh5rI+IY8HukIZJ1U6O7/JcjH3aRJ
      TZagXUS9AgMBAAECggEBALBIBx8JcWFfEDZFwuAWeUQ7+VX3mVx/770kOuNx24HY
      t718D/HV0avfKETHqOfA7AQnz42EF1Yd7Rux1ZO0e3unSVRJhMO4linT1XjJ9ScM
      ISAColWQHk3wY4va/FLPqG7N4L1w3BBtdjIc0A2zRGLNcFDBlxl/CVDHfcqD3CXd
      Lukm/friX6TvnrbTyfAFicYgu0+UtDvfxTL3pRL3u3WTkDvnFK5YXhoazLctNOFr
      NiiIpCW6dJ7WRYRXuXhz7C0rENHyBtJ0zura1WD5oDbRZ8ON4v1KV4QofWiTFXJp
      bDgZdEeJJmFmt5HIi+Ny3P5n31WwZpRMHGeHrV23//0CgYEA+2/gYjYWOW3JgMDL
      X7r8fGPTo1ljkOUHuH98H/a/lE3wnnKKx+2ngRNZX4RfvNG4LLeWTz9plxR2RAqq
      OTbX8fj/NA/sS4mru9zvzMY1925FcX3WsWKBgKlLryl0vPScq4ejMLSCmypGz4Vg
      LMYZqT4NYIkU2Lo1G1MiDoLy0CcCgYEAwt77exynUhM7AlyjhAA2wSINXLKsdFFF
      1u976x9kVhOfmbAutfMJPEQWb2WXaOJQMvMpgg2rU5aVsyEcuHsRH/2zatrxrGqL
      qgxaiqPz4ELINIh1iYK/hdRpr1vATHoebOv1wt8/9qxITNKtQTgQbqYci3KV1lPs
      OrBAB5S57nsCgYAvw+cagS/jpQmcngOEoh8I+mXgKEET64517DIGWHe4kr3dO+FF
      bc5eZPCbhqgxVJ3qUM4LK/7BJq/46RXBXLvVSfohR80Z5INtYuFjQ1xJLveeQcuh
      UxdK+95W3kdBBi8lHtVPkVsmYvekwK+ukcuaLSGZbzE4otcn47kajKHYDQKBgDbQ
      yIbJ+ZsRw8CXVHu2H7DWJlIUBIS3s+CQ/xeVfgDkhjmSIKGX2to0AOeW+S9MseiT
      E/L8a1wY+MUppE2UeK26DLUbH24zjlPoI7PqCJjl0DFOzVlACSXZKV1lfsNEeriC
      61/EstZtgezyOkAlSCIH4fGr6tAeTU349Bnt0RtvAoGBAObgxjeH6JGpdLz1BbMj
      8xUHuYQkbxNeIPhH29CySn0vfhwg9VxAtIoOhvZeCfnsCRTj9OZjepCeUqDiDSoF
      znglrKhfeKUndHjvg+9kiae92iI6qJudPCHMNwP8wMSphkxUqnXFR3lr9A765GA9
      80818UWZdrhrjLKtIIZdh+X1
      -----END PRIVATE KEY-----
    `,
    publicKey: process.env.TELEBIRR_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`
  },

  

  // Supabase Configuration - FIXED: Use correct variable names
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,


  // WordPress Configuration
  wordpress: {
    url: process.env.WORDPRESS_URL,
    apiKey: process.env.WORDPRESS_API_KEY
  },

  // Application Configuration
  port: process.env.PORT || 5000,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
};