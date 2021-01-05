<link rel="stylesheet" href="color.css">
<link rel="stylesheet" href="index.css">

<form action="index.php" method="POST" enctype="multipart/form-data">
    <div>
        <label>
            File: <input id="file" type="file" accept=".csv" name="file" onchange="resetLoadFileButton()">
        </label>
    </div>
    <div>
        <label>
            <input id="force_serialize" type="checkbox" name="force_serialize"> Is Force Serialize?
        </label>
    </div>
    <div>
        <button id="file-open" type="submit" value="open">Open file</button>
    </div>
</form>

<form action="savefile.php" method="POST" enctype="multipart/form-data">
    <?php
    if (isset($_FILES["file"])) {
        $serialized_pattern = "/^a:\d+:{/";
        $file_path = $_FILES['file']['tmp_name'];
        try {
            $file = fopen($file_path, "r+");
            $fields = fgetcsv($file);
            $id_idx = array_search("id", $fields, true);

            echo "<label for='filename'>File name</label>";
            echo "<input name='filename' value='" . htmlentities($_FILES['file']['name'], ENT_QUOTES) . "' required>";
            echo "<button type='submit' value='save'>Save file</button>";

            echo "<div class='fields-manipulator'>";
            echo "<table id='fields'>";
            echo
                "<thead>
                    <th>Field name</th>
                    <th>Is serialized</th>
                    <th># of keys</th>
                </thead>";
            echo "<tbody>";
            foreach ($fields as $key => $keyName) {
                echo
                    "<tr>
                        <td>
                            <input name='keys[{$key}]' onkeyup='changeFieldName(event)' value='" . htmlentities($keyName, ENT_QUOTES) . "' required>
                        </td>
                        <td>
                            <input type='checkbox'>
                        </td>
                        <td>
                            <input disabled>
                        </td>
                    </tr>";
            }
            echo "</tbody>";
            echo "</table>";
            echo "<button type='button' onclick='newField()'>Add new field</button>";
            echo "</div>";

            echo "<div><button type='button' onclick='createRecord()'>Add new record</button></div>";

            echo "<div id='records'>";
            $iter = 0;
            for ($iter; !feof($file); ++$iter) {
                // input name will be record[iterator][keyname]
                $name = "record[{$iter}]";
                $record = fgetcsv($file);
                // empty line
                if (empty($record)) {
                    break;
                }
                echo "<div class='csv-data' data-id='{$iter}'>";
                for ($i = 0; $i < count($record); ++$i) {
                    $recordName = "{$name}[{$fields[$i]}]";
                    $current = $record[$i];
                    if (isset($_POST['force_serialize']) and $fields[$i] == 'name') {
                        $serialized = serialize(['zh' => $current]);
                        $current = $serialized;
                    }
                    echo "<strong>$fields[$i]: </strong>";
                    if (preg_match($serialized_pattern, $current)) {
                        $data = unserialize($current);
                        echo "<div class='unserialized' data-serialize='$fields[$i]'>";
                        $j = 0;
                        foreach ($data as $key => $value) {
                            echo "<section data-name='{$recordName}' data-item='{$j}'>";
                            echo "<label>Key: </label>";
                            echo "<input name='{$recordName}[{$j}][key]' onkeyup='validateUnserializedFields(event)' value='" . htmlentities($key, ENT_QUOTES) . "' required>";
                            echo "<label>Value: </label>";
                            echo "<input name='{$recordName}[{$j}][value]' onkeyup='validateUnserializedFields(event)' value='" . htmlentities($value, ENT_QUOTES) . "' required>";
                            echo "<button type='button' onclick='removeItem(event)'>Remove</button>";
                            echo "</section>";
                            ++$j;
                        }
                        echo "</div>";
                        // add new button
                        echo
                            "<div>
                                <button id='newArrField' type='button' onclick='addItemField(event)'>Add new</button>
                            </div>";
                    } else {
                        echo "<input name='{$recordName}' value='" . htmlentities($current, ENT_QUOTES) . "' required>";
                        echo "<br/>";
                    }
                }
                echo "</div>";
            }
            echo "</div>";
            fclose($file);

            if ($iter) {
                echo "<div><button type='button' onclick='createRecord()'>Add new record</div>";
            }
        } catch (Exception $e) {
            echo "<div class='error'>{$e->getMessage()}</div>";
        }
    }
    ?>
</form>

<script type="text/javascript" src="index.js"></script>