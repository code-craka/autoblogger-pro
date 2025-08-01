<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    |
    | Laravel's queue supports a variety of backends via a single, unified
    | API, giving you convenient access to each backend using identical
    | syntax for each. The default queue connection is defined below.
    |
    */

    'default' => env('QUEUE_CONNECTION', 'redis'),

    /*
    |--------------------------------------------------------------------------
    | Queue Connections
    |--------------------------------------------------------------------------
    |
    | Here you may configure the connection options for every queue backend
    | used by your application. An example configuration is provided for
    | each backend supported by Laravel. You're also free to add more.
    |
    | Drivers: "sync", "database", "beanstalkd", "sqs", "redis", "null"
    |
    */

    'connections' => [
        'sync' => [
            'driver' => 'sync',
        ],

        'database' => [
            'driver' => 'database',
            'connection' => env('DB_QUEUE_CONNECTION'),
            'table' => env('DB_QUEUE_TABLE', 'jobs'),
            'queue' => env('DB_QUEUE', 'default'),
            'retry_after' => (int) env('DB_QUEUE_RETRY_AFTER', 90),
            'after_commit' => false,
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'queues',
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 300),
            'block_for' => null,
            'after_commit' => false,
            'batch' => [
                'database' => env('DB_CONNECTION', 'pgsql'),
                'table' => 'job_batches',
            ],
        ],

        'content_generation' => [
            'driver' => 'redis',
            'connection' => 'queues',
            'queue' => 'content-generation',
            'retry_after' => 600, // 10 minutes for AI operations
            'block_for' => null,
            'after_commit' => false,
        ],

        'bulk_processing' => [
            'driver' => 'redis',
            'connection' => 'queues',
            'queue' => 'bulk-processing',
            'retry_after' => 1800, // 30 minutes for bulk operations
            'block_for' => null,
            'after_commit' => false,
        ],

        'notifications' => [
            'driver' => 'redis',
            'connection' => 'queues',
            'queue' => 'notifications',
            'retry_after' => 60,
            'block_for' => null,
            'after_commit' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Batching
    |--------------------------------------------------------------------------
    |
    | The following options configure the database and table that store job
    | batching information. These options can be updated to any database
    | connection and table which has been defined by your application.
    |
    */

    'batching' => [
        'database' => env('DB_CONNECTION', 'sqlite'),
        'table' => 'job_batches',
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    |
    | These options configure the behavior of failed queue job logging so you
    | can control how and where failed jobs are stored. Laravel ships with
    | support for storing failed jobs in a simple file or in a database.
    |
    | Supported drivers: "database-uuids", "dynamodb", "file", "null"
    |
    */

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'sqlite'),
        'table' => 'failed_jobs',
    ],
];
