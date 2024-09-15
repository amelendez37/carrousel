const IMG_WIDTH = 150;

async function getImages(count) {
  const res = await fetch("https://jsonplaceholder.typicode.com/photos");
  const data = await res.json();
  return data.slice(0, count).map((img) => img.url);
}

function getUpdatedIndex(index, right) {
  if (right) {
    if (index === 2) {
      return 0;
    }
    return index + 1;
  } else {
    if (index === 0) {
      return 2;
    }
    return index - 1;
  }
}

function shiftImages(imageElements) {
  imageElements.forEach(({ pos, img }) => {
    if (
      pos >= -IMG_WIDTH &&
      pos <= document.getElementById("container").offsetWidth
    ) {
      img.style.transform = `translateX(${pos}px)`;
      img.style.visibility = "visible";
    }
    if (
      pos < -IMG_WIDTH ||
      pos >= document.getElementById("container").offsetWidth
    ) {
      img.style.visibility = "hidden";
    }
  });
}

function isOutOfBounds(pos) {
  const containerWidth = document.getElementById("container").offsetWidth;
  return pos < -IMG_WIDTH || pos > containerWidth;
}

function updateImagePositions(imageElements, distance) {
  imageElements.forEach(({ pos }, i) => {
    const updated = pos + distance;
    imageElements[i].pos = updated;
  });
  // need to potentially wrap images here, push out of bound images to front or back of imageElements?
  // if a new pos is out of bounds, move to other side of array and update pos relative to adjecent element
  const container = document.getElementById("container");
  if (distance < 0) {
    for (let i = 0; i < imageElements.length; i++) {
      if (!isOutOfBounds(imageElements[i].pos)) break;
      const el = imageElements.shift();
      el.pos = imageElements[imageElements.length - 1].pos + IMG_WIDTH;
      imageElements.push(el);
      // update dom
      const firstChild = container.children[0];
      container.removeChild(firstChild);
      container.appendChild(firstChild);
    }
  } else {
    // need to loop backwards
    for (let i = imageElements.length - 1; i >= 0; i--) {
      if (!isOutOfBounds(imageElements[i].pos)) break;
      const el = imageElements.pop();
      i++;
      el.pos = imageElements[0].pos - IMG_WIDTH;
      imageElements.unshift(el);
      // update dom
      const { children } = container;
      const lastChild = children[children.length - 1];
      container.removeChild(lastChild);
      container.insertBefore(lastChild, children[0]);
    }
  }
  shiftImages(imageElements);
}

function renderImages(images, imageElements) {
  const container = document.getElementById("container");
  images.forEach((imgUrl, i) => {
    const img = document.createElement("img");
    img.src = imgUrl;
    img.width = IMG_WIDTH;
    const containerWidth = container.offsetWidth;
    const offset = 8;
    img.style.position = "absolute";
    const pos = containerWidth / 2 - IMG_WIDTH / 2 + i * IMG_WIDTH - offset;
    img.style.transform = `translateX(${pos}px)`;
    img.classList.add("img");
    container.appendChild(img);
    imageElements.push({ img, pos });
  });

  // need to move any elements that go off right side of screen
  for (let i = imageElements.length - 1; i >= 0; i--) {
    if (!isOutOfBounds(imageElements[i].pos)) break;
    const el = imageElements.pop();
    i++;
    el.pos = imageElements[0].pos - IMG_WIDTH;
    imageElements.unshift(el);
    // update dom
    const { children } = container;
    const lastChild = children[children.length - 1];
    container.removeChild(lastChild);
    container.insertBefore(lastChild, children[0]);
  }
  shiftImages(imageElements);
}

async function run() {
  const imageElements = [];
  const images = await getImages(12);

  const leftBtn = document.getElementById("left-btn");
  leftBtn.onclick = () => {
    updateImagePositions(imageElements, IMG_WIDTH);
  };

  const rightBtn = document.getElementById("right-btn");
  rightBtn.onclick = () => {
    updateImagePositions(imageElements, -IMG_WIDTH);
  };

  renderImages(images, imageElements);
}

run();
