const numberUtil = {
  mebibytes(num) {
    return (num / (1024*1024)).toFixed(2);
  },

  gibibytes(num) {
    return (num / (1024*1024*1024)).toFixed(2);
  }
};

export default numberUtil;
