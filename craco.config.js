module.exports = {
  jest: {
    configure: {
      reporters: [
        "default",
        [
          "jestcloud-reporter",
          {
            tenantId: "182c894ce8e0aa526219b10f0e183637",
            tenantSecret:
              "5738aa7ca8cc55dab25ad9359c34d975d73c1802949780dac15405ac47c0e7f1d0c02ebb77b8349291310110af9fa075a39616b64437c95c28bd633387b5c6f5",
          },
        ],
      ],
    },
  },
};
