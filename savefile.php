<?php
    require 'vendor/autoload.php';
    try {
        if($_POST) {
            set_headers($_POST['filename']);
            
            $out = fopen('php://output', 'w');
            fputcsv($out, $_POST['keys']);
            foreach ($_POST['record'] as $r) {
                $values = array_map(function($each) {
                    return is_array($each) ? serialize_array_input($each) : $each;
                }, array_values($r));
                fputcsv($out, $values);
            }
            fclose($out);
        }
    } catch (Exception $e) {
        $smarty = new Smarty();
        $smarty->assign('error', $e);
        $smarty->display('error.tpl');
    }

    function set_headers($filename) {
        header('Content-Type: application/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename='.csv_file($filename));
    }

    function csv_file($filename) {
        if (strpos($filename, '.csv')) {
            return $filename;
        }
        else {
            return $filename.'.csv';
        }
    }

    function serialize_array_input($data) {
        $mapped_array = array_map(function($each) {
            // each $each will have key and value index
            return array($each['key'] => $each['value']);
        }, $data);
        $reduced_array = array_reduce($mapped_array, function($acc, $cur) {
            return array_merge($acc, $cur);
        }, array());
        return serialize($reduced_array);
    }
?>