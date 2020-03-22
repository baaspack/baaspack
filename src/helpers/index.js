const helpers = {
  isValidMongoId: (id) => {
    const regex = /^[a-f\d]{24}$/i;
    return regex.test(id);
  },
  isEmptyString: (str) => {
    return str === '';
  }
}

export default helpers;