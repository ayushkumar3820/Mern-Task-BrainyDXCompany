import React from 'react';

function Notification({ notifications = [] }) {
  return (
    <div className="fixed top-4 right-4 space-y-2">
      {notifications.map((note, index) => (
        <div key={index} className="bg-green-500 text-white p-4 rounded-md shadow-md">
          {note}
        </div>
      ))}
    </div>
  );
}

export default Notification;