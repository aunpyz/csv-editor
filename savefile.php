<link rel="stylesheet" href="./color.css">

<?php
    try {
        if($_POST) {
            $out = fopen($_POST["filename"], "w");
            fputcsv($out, $_POST["keys"]);
            foreach ($_POST["record"] as $r) {
                $values = array_map(function($each) {
                    return is_array($each) ? serialize_array_input($each) : $each;
                }, array_values($r));
                fputcsv($out, $values);
            }
            fclose($out);

            echo "<div class='success'>File saved successfully</div>";
        }
    } catch (Exception $e) {
        echo "<div class='error'>{$e->getMessage()}</div>";
    }

    function serialize_array_input($data) {
        $mapped_array = array_map(function($each) {
            // each $each will have key and value index
            return array($each["key"] => $each["value"]);
        }, $data);
        $reduced_array = array_reduce($mapped_array, function($acc, $cur) {
            return array_merge($acc, $cur);
        }, array());
        return serialize($reduced_array);
    }
?>