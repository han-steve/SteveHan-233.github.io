var animation = bodymovin.loadAnimation({
    container: document.getElementById('road-animation'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './graphics/data.json'
  })