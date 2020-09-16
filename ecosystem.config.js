const buildApps = function(name, instances, watch, env){
    return {
        name: name,
        script: "server.js",
        args: "--trace-warnings ",
        exec_mode: "cluster",
        instances: instances,
        watch: watch,
        env: {
            NODE_ENV: env,
        },
        error_file: env==='development'?'/home/middleware/log/err.log':"/data/log/middleware/err.log",
        out_file: env==='development'?'/home/middleware/log/out.log':"/data/log/middleware/out.log",
        combine_logs: false,
        merge_logs: false,
        log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
};

module.exports = {
    apps: [
        buildApps("middleware-production", 'max', false, "production"),
        buildApps("middleware-staging", 2, false, "staging"),
        buildApps("middleware", 1, true, "development")
    ]
};
