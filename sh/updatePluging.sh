cordova plugins | grep -Eo '^[^ ]+' | while read line
do
    echo "cordova plugin remove $line"
    echo "cordova plugin add $line"
done