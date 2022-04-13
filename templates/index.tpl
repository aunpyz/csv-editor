{extends 'layouts/default.tpl'}
{block 'css'}
    <link rel='stylesheet' href='color.css'>
    <link rel='stylesheet' href='index.css'>
{/block}
{block 'main'}
    <form action='index.php' method='POST' enctype='multipart/form-data'>
        <label>
            File: <input id='file' type='file' accept='.csv' name='file' onchange='resetLoadFileButton()'>
        </label>
        <button id='file-open' type='submit' value='open'>Open file</button>
    </form>
    {if isset($files['file'])}
        <form action='savefile.php' method='POST' enctype='multipart/form-data'>
            {$serialized_pattern = '/^a:\d+:{/'}
            {$file_path = $files['file']['tmp_name']}
            {$file=fopen($file_path, 'r+')}
            {$fields=fgetcsv($file)}
            <div>
                <label for='filename'>File name</label>
                <input name='filename' value='{$files['file']['name']}'>
                <button type='submit' value='save'>Save file</button>
            </div>
            <div class='fields-manipulator'>
                <table id='fields'>
                    <thead>
                        <th>Field name</th>
                        <th>Is serialized</th>
                        <th># of keys</th>
                    </thead>
                    <tbody>
                    {foreach $fields as $key => $key_name}
                        {$nthOfType=$key+1}
                        <tr>
                            <td>
                                <input name='keys[{$key}]' onkeyup='changeFieldName(event)' value='{$key_name}'>
                            </td>
                            <td>
                                <input type='checkbox' data-nth='{$nthOfType}' oninput='toggleFieldType(event)'>
                            </td>
                            <td>
                                <input disabled>
                            </td>
                        </tr>
                    {/foreach}
                    </tbody>
                </table>
                <button type='button' onclick='newField()'>Add new field</button>
            </div>
            <div>
                <button type='button' onclick='createRecord()'>Add new record</button>
            </div>
            <div id='records'>
                {$iter=0}
                {while not feof($file)}
                    {$name='record['|cat:$iter|cat:']'}
                    {$record=fgetcsv($file)}
                    {if not empty($record)}
                        <div class='csv-data' data-id='{$iter++}'>
                            {foreach $record as $key => $field}
                                {$record_name=$name|cat:'['|cat:$fields[$key]|cat:']'}
                                <div>
                                    <strong>{$fields[$key]}: </strong>
                                    {if preg_match($serialized_pattern, $field)}
                                        {$data_langs=unserialize($field)}
                                        <div class='unserialized' data-name='{$fields[$key]}'>
                                            {foreach $data_langs as $key => $data_lang}
                                                {$extended_record_name=$record_name|cat:'['|cat:$data_lang@index|cat:']'}
                                                <section data-name='{$record_name}' data-item='{$data_lang@index}'>
                                                    <label>Key: </label>
                                                    <input name='{$extended_record_name|cat:'[key]'}' onkeyup='changeKeyName(event)' value='{$key}'>
                                                    <label>Value: </label>
                                                    <input name='{$extended_record_name|cat:'[value]'}' value='{$data_lang}'>
                                                    <button type='button' onclick='removeItem(event)'>Remove</button>
                                                </section>
                                            {/foreach}
                                        </div>
                                        <div>
                                            <button class='newArrField' type='button' onclick='addItemField(event)'>Add new</button>
                                        </div>
                                    {else}
                                        <input name='{$record_name}' value='{$field}'>
                                    {/if}
                                </div>
                            {/foreach}
                        </div>
                    {/if}
                {/while}
            </div>
        </form>
    {/if}
{/block}
{block 'js'}
    <script type='text/javascript' src='index.js'></script>
{/block}
