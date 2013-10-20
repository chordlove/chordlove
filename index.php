<?php
header( 'Content-Type: text/html; charset=utf-8' );

$found = FALSE;

if ( $_SERVER['QUERY_STRING'] && $_SERVER['QUERY_STRING'] !== NULL && strlen($_SERVER['QUERY_STRING']) > 5 )
{
  $plugins = explode( '_', substr( $_SERVER['QUERY_STRING'], 1 ) );
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
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<title>$output - Chordlove.com</title>
<script>
  //window.location.replace( '/#!' + window.location.search.substring(1) );
</script>
</head>
<body>
  <header>
    <img src="http://cdn.chordlove.com/images/icon-47.png" alt="">
    <h1>$output</h1>
  </header>
  <div id="content">
    Chordlove is a tool for sharing song chords and lyrics.
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
