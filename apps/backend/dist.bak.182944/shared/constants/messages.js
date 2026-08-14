"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessage = exports.TypeErrorMessage = exports.NotFoundMessage = exports.BadRequestMessage = exports.PublicMessage = void 0;
exports.PublicMessage = {
    UploadedFiles: 'فایل‌ها با موفقیت آپلود شدند',
    DeletedFiles: 'فایل و پوستر با موفقیت حذف شدند',
    Updated: 'با موفقیت به روز رسانی شد',
    Like: 'با موفقیت لایک شد',
    CreatedComment: 'نظر شما ثبت شد',
    Registered: 'کاربر با موفقیت ثبت نام شد',
    LoggedOut: 'با موفقیت خارج شدید',
};
exports.BadRequestMessage = {
    InvalidCategories: 'دسته بندی ها را به درستی وارد کنید',
    UploadedFilesFailed: 'مشکلی در آپلود فایل‌ها رخ داد',
    FailedFetchingData: 'مشکلی در دریافت فایل‌ها رخ داد',
    FailedLike: 'مشکلی در ثبت لایک رخ داد',
    FailedUpdate: 'مشکلی در بروزرسانی رخ داد',
    FailedDelete: 'مشکلی در حذف رخ داد',
    FailedFetchingUser: 'مشکلی در دریافت کاربران رخ داد',
    NoChangesDetected: 'هیچ تغییری در داده‌ها یافت نشد.',
    PasswordMismatch: 'پسورد و تاییدیه پسورد باید یکسان باشند.',
    BothFilesRequired: 'هر دو فایل صوتی و پوستر الزامی هستند.',
    ImageRequired: 'فایل تصویر الزامی است.',
};
exports.NotFoundMessage = {
    NotFoundCategory: 'دسته بندی یافت نشد',
    NotFoundVideo: 'ویدیویی یافت نشد',
    NotFoundStories: 'استوری یافت نشد',
    NotFoundAudio: 'صوتی یافت نشد',
    NotFoundImage: 'تصویر موردنظر یافت نشد',
    NotFoundUser: 'کاربری یافت نشد',
    NotFoundComment: 'کامنت یافت نشد',
};
exports.TypeErrorMessage = {
    AudioTypeError: 'فایل صوتی باید mp3 باشد',
    VideoTypeError: 'فایل ویدیو باید mp4، webm یا mov باشد',
    PosterTypeError: 'فایل پوستر باید تصویر (jpeg، png یا webp) باشد',
};
exports.AuthMessage = {
    InvalidCredentials: 'رمز عبور یا نام کاربری صحیح نمی باشد',
    UserAlreadyExists: 'کاربر قبلا ثبت نام کرده',
    RefreshTokenNotFound: 'توکن یافت نشد',
    RefreshTokenInvalid: 'توکن معتبر نیست',
    RefreshTokenExpired: 'توکن منقضی شده است',
    AuthenticationRequired: 'به حساب کاربری خود وارد شوید',
    TooManyLoginAttempts: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً بعداً تلاش کنید',
};
//# sourceMappingURL=messages.js.map