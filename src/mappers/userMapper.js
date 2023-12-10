const mapUserToViewModel = (user) => {
  const { id, name, email, gender, hire_date } = user
  return { id, name, email, gender, hire_date }
}

module.exports = {
  mapUserToViewModel,
}
