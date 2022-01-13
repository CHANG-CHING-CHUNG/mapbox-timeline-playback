mapboxgl.accessToken =
  "pk.eyJ1Ijoia2FuZ2FuOTg3IiwiYSI6ImNreTQyOW9rNTA3b28ycHBiZWI5aWI5enEifQ.sg6R9-vN6WaQCEckkSvxKA";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  // center: [121.05951529779527,24.767772264803078],
  center: [-74.0059, 40.7128], // initial map center in [lon, lat]
  zoom:10
});
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  // When active the map will receive updates to the device's location as it changes.
  trackUserLocation: true,
  // Draw an arrow next to the location dot to indicate which direction the device is heading.
  showUserHeading: true,
});
map.addControl(new mapboxgl.NavigationControl());
map.addControl(geolocate);



map.on("load", () => {
  // geolocate.trigger();
  map.addLayer({
    id: 'collisions',
    type: 'circle',
    source: {
      type:'geojson',
      data :'./collisions1601.geojson'
    },
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['number',['get','Casualty']],
        0,
        4,
        5,
        24
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['number',['get','Casualty']],
        0,
        '#2DC4B2',
        1,
        '#3BB3C3',
        2,
        '#669EC4',
        3,
        '#8B88B6',
        4,
        '#A2719B',
        5,
        '#AA5E79'
      ],
      'circle-opacity': 0.8
    },
    filter: ['==', ['number', ['get', 'Hour']], 0]
  })
  let interval;
  const iconBtn = document.getElementById('icon-btn')
  let playBtn = document.querySelector('.start-playback')

  initEventListener('input','#slider',moveSlider)
  initEventListener('click','.start-playback',startPlayback)

  function initEventListener(event,className,callback){
    document.querySelector(className).addEventListener(event,callback)
  }

  function removeEventListener(event,className,callback) {
    document.querySelector(className).removeEventListener(event,callback)
  }
  

  function swichIcon() {
    if (iconBtn.classList.contains('fa-play-circle')) {
      iconBtn.classList.remove('fa-play-circle')
      iconBtn.classList.add('fa-stop-circle')
    } else {
      iconBtn.classList.remove('fa-stop-circle')
      iconBtn.classList.add('fa-play-circle')
    }
  }
  function swichBtn() {
    if (playBtn.classList.contains('start-playback')) {
      playBtn.classList.remove('start-playback')
      playBtn.classList.add('stop-playback')
      playBtn = document.querySelector('.stop-playback')
    } else {
      playBtn.classList.remove('stop-playback')
      playBtn.classList.add('start-playback')
      playBtn = document.querySelector('.start-playback')
    }
  }
  function switchListener() {
    if (playBtn.classList.contains('start-playback')) {
      removeEventListener('click','.start-playback',startPlayback)
      swichIcon()
      swichBtn()
      initEventListener('click','.stop-playback',stopPlayback)
    } else {
      removeEventListener('click','.stop-playback',stopPlayback)
      swichIcon()
      swichBtn()
      initEventListener('click','.start-playback',startPlayback)
    }
  }
  function startPlayback() {
    let hour = parseInt(document.getElementById('slider').value)
    switchListener()

    interval = setInterval(frame,200)
    
    function frame() {
      // converting 0-23 hour to AMPM format
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 ? hour % 12 : 12;
      // update the map
      map.setFilter('collisions', ['==', ['number', ['get', 'Hour']], hour]);
      
      // update text in the UI
      document.getElementById('active-hour').innerText = hour12 + ampm;
      document.getElementById('slider').value = hour
      hour++
      if (hour > 24) {
        removeInterval()
        switchListener()
        reset()
        return
      }
    }
  }

  function reset() {
    document.getElementById('active-hour').innerText = '12AM'
    map.setFilter('collisions', ['==', ['number', ['get', 'Hour']], 0]);
    document.getElementById('slider').value = 0
  }

  function stopPlayback() {
    removeInterval()
    switchListener()
  }


  function moveSlider(e) {
    if (interval) {
      removeInterval()
      removeEventListener('click','.stop-playback',stopPlayback)
      swichIcon()
      swichBtn()
      initEventListener('click','.start-playback',startPlayback)
    }
    const hour = parseInt(e.target.value);
    map.setFilter('collisions', ['==', ['number', ['get', 'Hour']], hour]);

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 ? hour % 12 : 12;

    document.getElementById('active-hour').innerText = hour12 + ampm;
  }

  function removeInterval() {
    clearInterval(interval)
    interval = ''
  }
});
