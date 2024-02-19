function status(request, response) {
  response.status(200).send({ msg: "ok" });
}

export default status;
