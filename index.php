<form action="index.php" method="POST" enctype="multipart/form-data">
    <input id="file" name="file" type="file" accept=".csv">
    <input type="submit" value="Submit" onclick="() => e.preventDefault">
</form>

<?php
    if (isset($_FILES['file'])) {
        $file_path = $_FILES['file']['tmp_name'];
        $file = fopen($file_path, "r+");
        $fields = fgetcsv($file);
        $id_idx = array_search("id", $fields, true);

        while(!feof($file)) {
            $record = fgetcsv($file);
            echo "<div class='csv-data' data-id={$record[$id_idx]}>";
            for($i = 0; $i < count($record); ++$i) {
                echo $fields[$i] . " : ";
                echo "<input type='text' value={$record[$i]}>";
                echo "<br/>";
            }
            echo "</div>";
        }
        fclose($file);
    }
?>

<style>
    .csv-data {
        border: 2px solid red;
        margin: 8px;
        padding: 8px;
    }
</style>