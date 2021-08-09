const rootStyles = window.getComputedStyle(document.documentElement)

if(rootStyles.getPropertyValue ('--recipe-photo-width-large') != null){
  ready()
} else{
  document.getElementById('main/css').addEventListener('load', ready)
}

function ready(){
  const photoWidth = rootStyles.getPropertyValue('--recipe-photo-width-large')
  const photoAspectRatio = rootStyles.getPropertyValue('--recipe-photo-aspect-ratio')
  const photoHeight = photoWidth/photoAspectRatio;

  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )
  
  FilePond.setOptions({
    stylePanelAspectRatio: photoAspectRatio,
    imageResizeTargetWidth: photoWidth,
    imageResizeTargetHeight: photoHeight
  })
  
  FilePond.parse(document.body);
}

