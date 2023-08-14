{extends 'layouts/default.tpl'}
{block 'css'}
    <link rel='stylesheet' href='index.css'>
{/block}
{block 'main'}
    <form action='index.php' method='POST' enctype='multipart/form-data' class='container my-4'>
        <div class='row g-3 align-items-center'>
            <div class='col-auto'>
                <label class='col-form-label'>File:</label>
            </div>
            <div class='col-auto'>
                <input id='file' type='file' accept='.csv' name='file' class='form-control'>
            </div>
            <div class='col-auto'>
                <button id='file-open' type='submit' value='open' class='btn btn-primary'>Open file</button>
            </div>
        </div>
    </form>
    {if isset($files['file'])}
        <form action='savefile.php' method='POST' enctype='multipart/form-data' class='container my-4'>
            {$serialized_pattern = '/^a:\d+:{/'}
            {$file_path = $files['file']['tmp_name']}
            {$file=fopen($file_path, 'r+')}
            {$fields=fgetcsv($file)}
            <div class='row g-3 align-items-center'>
                <div class='col-auto'>
                    <label for='filename' class='col-form-label'>File name</label>
                </div>
                <div class='col-auto'>
                    <input name='filename' value='{htmlentities($files['file']['name'])}' class='form-control'>
                </div>
                <div class='col-auto'>
                    <button type='submit' value='save' class='btn btn-success'>Save file</button>
                </div>
            </div>
            <div class='fields-manipulator p-2 my-4 border border-2 border-primary rounded'>
                <table id='fields' class='table'>
                    <thead>
                        <th>Field name</th>
                        <th>Is serialized</th>
                        <th># of keys</th>
                    </thead>
                    <tbody class='table-group-divider'>
                    {foreach $fields as $key => $key_name}
                        {$nthOfType=$key+1}
                        <tr>
                            <td>
                                <input name='keys[{$key}]' value='{htmlentities($key_name)}' class='form-control'>
                            </td>
                            <td class='text-center align-middle'>
                                <input type='checkbox' data-nth='{$nthOfType}' class='form-check-input'>
                            </td>
                            <td>
                                <input disabled class='form-control'>
                            </td>
                        </tr>
                    {/foreach}
                    </tbody>
                </table>
                <button type='button' class='btn btn-success'>Add new field</button>
            </div>
            <div>
                <button id='new-record' type='button' class='btn btn-primary'>Add new record</button>
            </div>
            <div id='records' class='p-2 my-4 border border-2 border-success rounded'>
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
                                                    <input name='{$extended_record_name|cat:'[key]'}' value='{htmlentities($key)}'>
                                                    <label>Value: </label>
                                                    <input name='{$extended_record_name|cat:'[value]'}' value='{htmlentities($data_lang)}'>
                                                    <button type='button' class='btn btn-danger'>Remove</button>
                                                </section>
                                            {/foreach}
                                        </div>
                                        <div>
                                            <button type='button' class='new-arr-field btn btn-success'>Add new</button>
                                        </div>
                                    {else}
                                        <input name='{$record_name}' value='{htmlentities($field)}'>
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
    <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js' integrity='sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==' crossorigin='anonymous' referrerpolicy='no-referrer'></script>
    <script type='text/javascript' src='index.js'></script>
{/block}
