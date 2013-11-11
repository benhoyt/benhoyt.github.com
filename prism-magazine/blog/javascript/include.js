imageNum = 1;

function addImage() {
  imageInputsElem = document.getElementById("imageInputs");

  imgInput = document.createElement("div");
  imgInput.id = "images" + imageNum + "";
  imgInput.setAttribute("className", "imageInput");
  imgInput.setAttribute("class", "imageInput");

  fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("name", "images" + imageNum + "");
  fileInput.setAttribute("onchange", "insertImageName(this.value);");
  
  remButton = document.createElement("button");
  remButton.setAttribute("type", "button");
  remButton.setAttribute("onclick", "removeImage('images" + imageNum + "');");
  remButton.appendChild(document.createTextNode("Remove this image"));

  imgInput.appendChild(fileInput);
  imgInput.appendChild(document.createTextNode(" "));
  imgInput.appendChild(remButton);
  imageInputsElem.appendChild(imgInput);

  imageNum++;
}

function insertImageName(resVal) {
  indexSlash = resVal.lastIndexOf("/");
  indexBackslash = resVal.lastIndexOf("\\");
  
  slashIndex = Math.max(indexSlash, indexBackslash);
  
  resName = resVal.substring(slashIndex + 1)

  contentTextElem = document.getElementById("contentText");
  contentTextElem.value = "[image:" + resName + "]" + contentTextElem.value;
}

function removeImage(id) {
  imageInputsElem = document.getElementById("imageInputs");
  imageElem = document.getElementById(id);
  imageInputsElem.removeChild(imageElem);
}
