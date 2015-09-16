const stringUtil = {
  capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  },

  titleize(str) {
    return str.split(' ').map((s) => {
      return this.capitalize(s);
    }).join(' ');
  }
};

export default stringUtil;
