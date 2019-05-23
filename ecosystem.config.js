module.exports = {
    apps: [
        {
            name: 'Sweden-weather-spider',
            script: 'dist/index.js',
            args: '--nolazy --inspect=0.0.0.0:65535',
            node_args: '--nolazy --inspect=0.0.0.0:65535',
            instances: 1,
            autorestart: true,
            watch: true,
            'restart-delay': 10,
            ignore_watch: [
                'dist',
                'src/data',
                '.vscode',
                '.git',
                '.gitignore',
                'node_modules'
            ],
            max_memory_restart: '2G',
            output: 'dist/logs/log.log',
            error: 'dist/logs/error.err',
            log_date_format: 'YYYY-MM-DD HH:mm',
            merge_logs: true,
        }
    ]
};
