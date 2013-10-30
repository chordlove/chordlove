<?php
header( 'Content-Type: text/html; charset=utf-8' );

$found = FALSE;

$uri = $_SERVER['REQUEST_URI'];
if ( $uri && strlen($uri) > 5 )
{
  $plugins = explode( '_', substr( $uri, 2 ) );
  foreach ( $plugins as $plugin )
  {
    if ( strlen( $plugin ) > 3 && substr( $plugin, 0, 2 ) == '00' )
    {
      $content = rawurldecode( substr( $plugin, 3 ) );
      $search = array( '~0', '~1', '~b', '~s', '~-', '~~', );
      $replace = array( ' ', '\n', 'b', '#', '_', '~' );
      $output = str_replace( $search, $replace, $content );
      $hash = $_SERVER['QUERY_STRING'];
      echo <<<EOT
<!DOCTYPE html>
<html>
<head>
<meta content='text/html; charset=UTF-8' name='Content-Type'>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

<title>$output - Chordlove.com</title>

<meta name=”description” content=”$output at Chordlove, the number one free online tool for sharing song chords and lyrics.”>

<meta property="fb:app_id" content="170264763172639">
<meta property=”og:type” content=”chordlove:chordlove_song”>
<meta property=”og:title” content=”$output at Chordlove.com.”>
<meta property=”og:image” content=”http://cdn.chordlove.com/images/icon-600.png”>
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="600">
<meta property="og:image:height" content="600">
<meta property=”og:description” content=”$output at Chordlove.com, the number one free online tool for sharing song chords and lyrics.”>

<meta name=”twitter:card” content=”summary”>
<meta name="twitter:site" content="@ChordloveApp">
<meta name="twitter:domain" content="chordlove.com">
<meta name=”twitter:title” content=”$output - Chordlove.com”>
<meta name=”twitter:description” content=”$output - Chordlove.com, the number one free online tool for sharing song chords and lyrics.”>
<meta name=”twitter:image:src” content=”http://cdn.chordlove.com/images/icon-600.png”>

<script>
  window.location.replace( '/#!' + window.location.search.substring(1) );
</script>
</head>
<body itemscope itemtype="http://schema.org/Article">
  <header>
    <h1 itemprop="name">$output</h1>
  </header>
  <div id="content">
    <p itemprop="description">
    <img itemprop="image" src="http://cdn.chordlove.com/images/icon-600.png" alt="" style="width:3.75em;height:3.75em;">
    Chordlove.com, the number one free online tool for sharing song chords and lyrics.
    </p>
  </div>
</body>
</html>
EOT;
      $found = TRUE;
      break;
    }
  }
}

if ( !$found )
{
  readfile('index.html');
}

?>
