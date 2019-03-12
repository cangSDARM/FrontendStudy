import React from 'react';

//消息订阅包
import Pubsub from 'pubsub-js';

Pubsub.subscribe('delate', function(data){})	//订阅

Pubsub.publish('delate', data)	//发布