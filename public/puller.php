<?php
    $shell = shell_exec('cd /home/middleware/middleware && git pull origin master');
    // $shell = shell_exec("pm2");
    // $shell .= shell_exec('sh /home/dapobud/restart-pm2.sh');

print_r($shell);die;
