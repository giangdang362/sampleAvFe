# /bin/sh
echo $CI_COMMIT_MESSAGE
curl --location 'https://lotuslts.webhook.office.com/webhookb2/89cab154-d949-4e83-be0b-18e9242df007@16adadf2-2d1d-491c-b6af-15085fb446ad/IncomingWebhook/b266e009f9554ec49abb3c62a3bb6a8c/a186e14b-e351-4c46-aa1b-a6b60293b33a' \
--header 'Content-Type: application/json' \
--data-raw '{
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": "0076D7",
    "summary": "Đã deploy thành công backend AVCI",
    "sections": [{
        "activityTitle": "Đã deploy thành công backend AVCI",
        "text": '"'$CI_COMMIT_MESSAGE'"',
        "activitySubtitle": "On Project AVCI",
        "activityImage": "https://adaptivecards.io/content/cats/3.png",
        "markdown": true
    }]
}'

