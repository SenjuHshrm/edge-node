module.exports = {
  /**
   * 
   * Test for GET request
   *
   * @returns response object
   */
  get: (req, res) => {
    return res.status(200).json({ msg: 'This is a test route for GET request' })
  },
  
  /**
   * 
   * Test for POST request
   * 
   * @returns response object
   */
  post: (req, res) => {
    return res.status(200).json({ msg: 'This is a test route for POST request' })
  },

  /**
   * 
   * Test for PUT request
   * 
   * @returns response object
   */
  put: (req, res) => {
    return res.status(200).json({ msg: 'This is a test route for PUT request' })
  },

  /**
   * 
   * Test for DELETE request
   * 
   * @returns response object
   */
  delete: (req, res) => {
    return res.status(200).json({ msg: 'This is a test route for DELETE request' })
  }
}