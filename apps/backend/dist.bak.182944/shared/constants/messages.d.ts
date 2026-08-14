export declare const PublicMessage: {
    readonly UploadedFiles: "فایل‌ها با موفقیت آپلود شدند";
    readonly DeletedFiles: "فایل و پوستر با موفقیت حذف شدند";
    readonly Updated: "با موفقیت به روز رسانی شد";
    readonly Like: "با موفقیت لایک شد";
    readonly CreatedComment: "نظر شما ثبت شد";
    readonly Registered: "کاربر با موفقیت ثبت نام شد";
    readonly LoggedOut: "با موفقیت خارج شدید";
};
export declare const BadRequestMessage: {
    readonly InvalidCategories: "دسته بندی ها را به درستی وارد کنید";
    readonly UploadedFilesFailed: "مشکلی در آپلود فایل‌ها رخ داد";
    readonly FailedFetchingData: "مشکلی در دریافت فایل‌ها رخ داد";
    readonly FailedLike: "مشکلی در ثبت لایک رخ داد";
    readonly FailedUpdate: "مشکلی در بروزرسانی رخ داد";
    readonly FailedDelete: "مشکلی در حذف رخ داد";
    readonly FailedFetchingUser: "مشکلی در دریافت کاربران رخ داد";
    readonly NoChangesDetected: "هیچ تغییری در داده‌ها یافت نشد.";
    readonly PasswordMismatch: "پسورد و تاییدیه پسورد باید یکسان باشند.";
    readonly BothFilesRequired: "هر دو فایل صوتی و پوستر الزامی هستند.";
    readonly ImageRequired: "فایل تصویر الزامی است.";
};
export declare const NotFoundMessage: {
    readonly NotFoundCategory: "دسته بندی یافت نشد";
    readonly NotFoundVideo: "ویدیویی یافت نشد";
    readonly NotFoundStories: "استوری یافت نشد";
    readonly NotFoundAudio: "صوتی یافت نشد";
    readonly NotFoundImage: "تصویر موردنظر یافت نشد";
    readonly NotFoundUser: "کاربری یافت نشد";
    readonly NotFoundComment: "کامنت یافت نشد";
};
export declare const TypeErrorMessage: {
    readonly AudioTypeError: "فایل صوتی باید mp3 باشد";
    readonly VideoTypeError: "فایل ویدیو باید mp4، webm یا mov باشد";
    readonly PosterTypeError: "فایل پوستر باید تصویر (jpeg، png یا webp) باشد";
};
export declare const AuthMessage: {
    readonly InvalidCredentials: "رمز عبور یا نام کاربری صحیح نمی باشد";
    readonly UserAlreadyExists: "کاربر قبلا ثبت نام کرده";
    readonly RefreshTokenNotFound: "توکن یافت نشد";
    readonly RefreshTokenInvalid: "توکن معتبر نیست";
    readonly RefreshTokenExpired: "توکن منقضی شده است";
    readonly AuthenticationRequired: "به حساب کاربری خود وارد شوید";
    readonly TooManyLoginAttempts: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً بعداً تلاش کنید";
};
