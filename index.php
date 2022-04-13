<?php
    require 'vendor/autoload.php';
    $smarty = new Smarty();
    $smarty->assign('files', $_FILES);
    $smarty->display('index.tpl');
?>
