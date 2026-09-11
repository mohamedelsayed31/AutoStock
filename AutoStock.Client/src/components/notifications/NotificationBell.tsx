import {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from "react";
  
  import {
    Bell,
    CheckCheck,
    CircleAlert,
    PackageX,
    ReceiptText,
    TriangleAlert,
  } from "lucide-react";
  
  import {
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } from "../../services/notificationService";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import {
    useToast,
  } from "../../hooks/useToast";
  
  import type {
    Notification,
  } from "../../types/notification";
  
  
  function NotificationBell() {
    const navigate =
      useNavigate();

    const location =
      useLocation();
  
  
    const {
      showToast,
    } = useToast();
  
  
    const containerRef =
      useRef<HTMLDivElement | null>(
        null
      );
  
  
    const [
      open,
      setOpen,
    ] =
      useState(false);
  
  
    const [
      notifications,
      setNotifications,
    ] =
      useState<Notification[]>([]);
  
  
    const [
      unreadCount,
      setUnreadCount,
    ] =
      useState(0);
  
  
    const [
      loading,
      setLoading,
    ] =
      useState(false);
  
  
    const [
      markingAll,
      setMarkingAll,
    ] =
      useState(false);
  
  
    /* =========================
       Load Count
    ========================= */
  
    const loadUnreadCount =
      useCallback(
        async () => {
  
          try {
            const count =
              await getUnreadNotificationCount();
  
  
            setUnreadCount(
              count
            );
          }
          catch {
            /*
             * Do not break the layout
             * if notification count fails.
             */
          }
        },
        []
      );
  
  
    /* =========================
       Load Notifications
    ========================= */
  
    const loadNotifications =
      useCallback(
        async () => {
  
          setLoading(true);
  
  
          try {
            const result =
              await getNotifications(
                20
              );
  
  
            setNotifications(
              result
            );
          }
          catch (error) {
  
            showToast(
              getApiErrorMessage(
                error,
                "Failed to load notifications."
              ),
              "error"
            );
          }
          finally {
  
            setLoading(false);
          }
        },
        [showToast]
      );
  
  
    /* =========================
       Initial Count
    ========================= */
  
    useEffect(() => {

        void loadUnreadCount();
      
      }, [
        loadUnreadCount,
        location.pathname,
      ]);
  
  
    /* =========================
       Load When Opened
    ========================= */
  
    useEffect(() => {
  
      if (open) {
        void loadNotifications();
        void loadUnreadCount();
      }
  
    }, [
      open,
      loadNotifications,
      loadUnreadCount,
    ]);
  
  
    /* =========================
       Close Outside
    ========================= */
  
    useEffect(() => {
  
      const handleClickOutside = (
        event: MouseEvent
      ) => {
  
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as Node
          )
        ) {
          setOpen(false);
        }
      };
  
  
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
  
  
      return () => {
  
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );
      };
  
    }, []);
  
  
    /* =========================
       Format Date
    ========================= */
  
    const formatDate = (
      value: string
    ) => {
  
      const date =
        new Date(value);
  
  
      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }
  
  
      return date.toLocaleString(
        "en-EG",
        {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };
  
  
    /* =========================
       Icon
    ========================= */
  
    const getNotificationIcon = (
      type: number
    ) => {
  
      switch (type) {
  
        case 1:
          return (
            <TriangleAlert
              size={17}
            />
          );
  
        case 2:
          return (
            <PackageX
              size={17}
            />
          );
  
        case 3:
          return (
            <ReceiptText
              size={17}
            />
          );
  
        default:
          return (
            <CircleAlert
              size={17}
            />
          );
      }
    };
  
  
    /* =========================
       Open Notification
    ========================= */
  
    const handleNotificationClick =
      async (
        notification: Notification
      ) => {
  
        try {
          if (
            !notification.isRead
          ) {
            await markNotificationAsRead(
              notification.id
            );
  
  
            setNotifications(
              current =>
                current.map(
                  item =>
                    item.id ===
                    notification.id
                      ? {
                          ...item,
                          isRead: true,
                        }
                      : item
                )
            );
  
  
            setUnreadCount(
              current =>
                Math.max(
                  0,
                  current - 1
                )
            );
          }
  
  
          setOpen(false);
  
  
          if (
            notification.entityName ===
              "Sale" &&
            notification.entityId
          ) {
            navigate(
              `/sales/${notification.entityId}`
            );
  
            return;
          }
  
  
          if (
            notification.entityName ===
              "Car" &&
            notification.entityId
          ) {
            navigate(
              `/cars/${notification.entityId}`
            );
          }

          if (
            notification.entityName ===
              "PurchaseOrder" &&
            notification.entityId
          ) {
            navigate(
              `/admin/purchase-orders/${notification.entityId}`
            );
          
            return;
          }
        }
        catch (error) {
  
          showToast(
            getApiErrorMessage(
              error,
              "Failed to update notification."
            ),
            "error"
          );
        }
      };
  
  
    /* =========================
       Mark All
    ========================= */
  
    const handleMarkAllAsRead =
      async () => {
  
        if (
          unreadCount === 0
        ) {
          return;
        }
  
  
        setMarkingAll(true);
  
  
        try {
          await markAllNotificationsAsRead();
  
  
          setNotifications(
            current =>
              current.map(
                notification => ({
                  ...notification,
                  isRead: true,
                })
              )
          );
  
  
          setUnreadCount(0);
  
  
          showToast(
            "All notifications marked as read.",
            "success"
          );
        }
        catch (error) {
  
          showToast(
            getApiErrorMessage(
              error,
              "Failed to mark notifications as read."
            ),
            "error"
          );
        }
        finally {
  
          setMarkingAll(false);
        }
      };
  
  
    return (
      <div
        className="notification-bell"
        ref={
          containerRef
        }
      >
  
        {/* Bell */}
  
        <button
          type="button"
          className="notification-bell-button"
          aria-label="Notifications"
          onClick={() =>
            setOpen(
              current =>
                !current
            )
          }
        >
          <Bell
            size={20}
          />
  
  
          {unreadCount > 0 && (
  
            <span className="notification-badge">
  
              {unreadCount > 99
                ? "99+"
                : unreadCount}
  
            </span>
  
          )}
  
        </button>
  
  
        {/* Dropdown */}
  
        {open && (
  
          <div className="notification-dropdown">
  
            {/* Header */}
  
            <div className="notification-dropdown-header">
  
              <div>
  
                <strong>
                  Notifications
                </strong>
  
                <span>
                  {unreadCount}
                  {" "}
                  unread
                </span>
  
              </div>
  
  
              <button
                type="button"
                disabled={
                  markingAll ||
                  unreadCount === 0
                }
                onClick={
                  handleMarkAllAsRead
                }
              >
                <CheckCheck
                  size={15}
                />
  
                {markingAll
                  ? "Updating..."
                  : "Mark all read"}
              </button>
  
            </div>
  
  
            {/* Content */}
  
            <div className="notification-list">
  
              {loading ? (
  
                <div className="notification-message">
                  Loading notifications...
                </div>
  
              ) : notifications.length ===
                0 ? (
  
                <div className="notification-message">
  
                  <Bell
                    size={24}
                  />
  
                  <strong>
                    No Notifications
                  </strong>
  
                  <span>
                    You're all caught up.
                  </span>
  
                </div>
  
              ) : (
  
                notifications.map(
                  notification => (
  
                    <button
                      type="button"
                      key={
                        notification.id
                      }
                      className={
                        notification.isRead
                          ? "notification-item"
                          : "notification-item notification-item-unread"
                      }
                      onClick={() =>
                        void handleNotificationClick(
                          notification
                        )
                      }
                    >
  
                      <div
                        className={
                          `notification-type-icon notification-type-${notification.type}`
                        }
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>
  
  
                      <div className="notification-item-content">
  
                        <div className="notification-item-title">
  
                          <strong>
                            {notification.title}
                          </strong>
  
  
                          {!notification.isRead && (
                            <span className="notification-unread-dot" />
                          )}
  
                        </div>
  
  
                        <p>
                          {notification.message}
                        </p>
  
  
                        <span>
                          {formatDate(
                            notification.createdAt
                          )}
                        </span>
  
                      </div>
  
                    </button>
  
                  )
                )
  
              )}
  
            </div>
  
          </div>
  
        )}
  
      </div>
    );
  }
  
  
  export default NotificationBell;