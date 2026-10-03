import { createSignal, onMount, Show } from "solid-js";
import { authStore } from "../../auth/stores/authStore";
import {
  updateProfileApi,
  uploadAvatarApi,
  initiateEmailChangeApi,
  confirmEmailChangeApi,
} from "../../../api/profile";

export function PersonalDetailsTab() {
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [phoneNumber, setPhoneNumber] = createSignal("");
  const [optionalPhoneNumber, setOptionalPhoneNumber] = createSignal("");
  const [dob, setDob] = createSignal("");
  const [gender, setGender] = createSignal("");
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null);
  const [avatarFile, setAvatarFile] = createSignal<File | null>(null);
  const [isSaving, setIsSaving] = createSignal(false);
  const [isUploading, setIsUploading] = createSignal(false);

  // Email change modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = createSignal(false);
  const [newEmail, setNewEmail] = createSignal("");
  const [emailToken, setEmailToken] = createSignal("");
  const [emailStep, setEmailStep] = createSignal<"input" | "confirm">("input");

  onMount(() => {
    const u = authStore.user();
    if (u) {
      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setPhoneNumber(u.phoneNumber || "");
      setOptionalPhoneNumber(u.optionalPhoneNumber || "");
      setDob(u.dob || "");
      setGender(u.gender || "");
      setAvatarPreview(u.avatarUrl || null);
    }
  });

  const isDirty = () => {
    const u = authStore.user();
    if (!u) return false;
    return (
      firstName() !== (u.firstName || "") ||
      lastName() !== (u.lastName || "") ||
      phoneNumber() !== (u.phoneNumber || "") ||
      optionalPhoneNumber() !== (u.optionalPhoneNumber || "") ||
      dob() !== (u.dob || "") ||
      gender() !== (u.gender || "")
    );
  };

  const isValid = () =>
    firstName().trim().length > 0 &&
    lastName().trim().length > 0 &&
    phoneNumber().trim().length > 0;

  const handleAvatarSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    const file = avatarFile();
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadAvatarApi(file, authStore.accessToken());
      if (authStore.user()) {
        authStore.user()!.avatarUrl = res.avatarUrl;
      }
      setAvatarFile(null);
      authStore.showToast("Avatar successfully updated!");
    } catch (err: any) {
      authStore.showToast(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: Event) => {
    e.preventDefault();
    if (!isValid() || !isDirty()) return;
    setIsSaving(true);
    try {
      const updated = await updateProfileApi(
        {
          firstName: firstName(),
          lastName: lastName(),
          phoneNumber: phoneNumber().trim(),
          optionalPhoneNumber: optionalPhoneNumber().trim() || undefined,
          dob: dob() || undefined,
          gender: gender() || undefined,
        },
        authStore.accessToken()
      );
      // Update local store user
      if (authStore.user()) {
        authStore.user()!.firstName = updated.firstName;
        authStore.user()!.lastName = updated.lastName;
        authStore.user()!.phoneNumber = updated.phoneNumber;
        authStore.user()!.optionalPhoneNumber = updated.optionalPhoneNumber;
        authStore.user()!.phoneVerified = true;
        authStore.user()!.dob = updated.dob;
        authStore.user()!.gender = updated.gender;
      }
      authStore.showToast("Personal details saved successfully!");
    } catch (err: any) {
      authStore.showToast(`Failed to update profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitiateEmail = async () => {
    if (!newEmail() || !newEmail().includes("@")) {
      authStore.showToast("Please enter a valid email address");
      return;
    }
    try {
      await initiateEmailChangeApi(newEmail(), authStore.accessToken());
      setEmailStep("confirm");
      authStore.showToast("Verification link sent! Check server console / token input");
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  const handleConfirmEmail = async () => {
    if (!emailToken()) return;
    try {
      const updated = await confirmEmailChangeApi(emailToken());
      if (authStore.user()) {
        authStore.user()!.email = updated.email;
        authStore.user()!.emailVerified = true;
      }
      setIsEmailModalOpen(false);
      setEmailStep("input");
      setNewEmail("");
      setEmailToken("");
      authStore.showToast("Email successfully changed and verified!");
    } catch (err: any) {
      authStore.showToast(err.message);
    }
  };

  return (
    <div class="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-[var(--text-primary)]">Personal Details</h1>
        <p class="text-xs text-[var(--text-secondary)] mt-1">
          Manage your identity, contact information, and public avatar.
        </p>
      </div>

      {/* Avatar Section */}
      <div class="p-6 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-6">
        <div class="relative w-24 h-24 rounded-2xl overflow-hidden bg-[var(--brand-100)] dark:bg-[var(--brand-900)] border border-[var(--border)] flex items-center justify-center text-3xl font-bold text-[var(--brand-600)] shadow-inner">
          {avatarPreview() ? (
            <img src={avatarPreview()!} alt="Avatar" class="w-full h-full object-cover" />
          ) : (
            <span>{authStore.user()?.firstName?.[0] || "U"}</span>
          )}
        </div>
        <div class="flex-1 text-center sm:text-left space-y-2">
          <h4 class="text-sm font-bold text-[var(--text-primary)]">Profile Photo</h4>
          <p class="text-xs text-[var(--text-secondary)]">
            Upload a PNG, JPG or WebP image. Maximum recommended size 2MB.
          </p>
          <div class="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-1">
            <label class="cursor-pointer px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border)]/50 border border-[var(--border)] text-xs font-semibold transition-all">
              <span>Choose Image</span>
              <input type="file" accept="image/*" class="hidden" onChange={handleAvatarSelect} />
            </label>
            <Show when={avatarFile()}>
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={isUploading()}
                class="px-4 py-2 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {isUploading() ? "Uploading..." : "Confirm Upload"}
              </button>
            </Show>
          </div>
        </div>
      </div>

      {/* Main Details Form */}
      <form onSubmit={handleSaveProfile} class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">First Name *</label>
            <input
              type="text"
              value={firstName()}
              onInput={(e) => setFirstName(e.currentTarget.value)}
              placeholder="Your first name"
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Last Name *</label>
            <input
              type="text"
              value={lastName()}
              onInput={(e) => setLastName(e.currentTarget.value)}
              placeholder="Your last name"
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
              Permanent Phone Number * <span class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">(Mandatory)</span>
            </label>
            <input
              id="permanent-phone-input"
              type="tel"
              value={phoneNumber()}
              onInput={(e) => setPhoneNumber(e.currentTarget.value)}
              placeholder="+91 98765 43210"
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
              Optional Phone Number <span class="text-[10px] text-[var(--text-secondary)] font-normal">(Optional)</span>
            </label>
            <input
              id="optional-phone-input"
              type="tel"
              value={optionalPhoneNumber()}
              onInput={(e) => setOptionalPhoneNumber(e.currentTarget.value)}
              placeholder="Alternate phone number (optional)"
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Date of Birth</label>
            <input
              type="date"
              value={dob()}
              onInput={(e) => setDob(e.currentTarget.value)}
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">Gender (Optional)</label>
            <select
              value={gender()}
              onChange={(e) => setGender(e.currentTarget.value)}
              class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
            >
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="NON_BINARY">Non-binary</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isDirty() || !isValid() || isSaving()}
            class="px-6 py-2.5 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving() ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <hr class="border-[var(--border)]" />

      {/* Contact Credentials Section */}
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-[var(--text-primary)]">Contact Credentials</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Card */}
          <div class="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[var(--text-primary)]">{authStore.user()?.email}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <p class="text-[11px] text-[var(--text-secondary)] mt-1">Used for logins and notifications</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEmailModalOpen(true);
                setEmailStep("input");
              }}
              class="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold transition-all"
            >
              Change
            </button>
          </div>

          {/* Phone Card */}
          <div class="p-5 rounded-2xl bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[var(--text-primary)]">
                  {authStore.user()?.phoneNumber || "No permanent phone set"}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Permanent
                </span>
              </div>
              <Show when={authStore.user()?.optionalPhoneNumber}>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[11px] text-[var(--text-secondary)]">
                    Optional: {authStore.user()?.optionalPhoneNumber}
                  </span>
                </div>
              </Show>
              <p class="text-[11px] text-[var(--text-secondary)] mt-1">Directly updated in Personal Details (no OTP needed)</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("permanent-phone-input");
                el?.focus();
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              class="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold transition-all"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      <Show when={isEmailModalOpen()}>
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 class="text-base font-bold text-[var(--text-primary)]">Change Email Address</h3>
            <p class="text-xs text-[var(--text-secondary)]">
              Changing your email will require confirming a secure verification token sent to the new email address.
            </p>

            <Show when={emailStep() === "input"}>
              <div class="space-y-3">
                <label class="block text-xs font-semibold text-[var(--text-secondary)]">New Email Address</label>
                <input
                  type="email"
                  value={newEmail()}
                  onInput={(e) => setNewEmail(e.currentTarget.value)}
                  placeholder="name@example.com"
                  class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                />
                <div class="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleInitiateEmail}
                    class="px-4 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold"
                  >
                    Send Verification Link
                  </button>
                </div>
              </div>
            </Show>

            <Show when={emailStep() === "confirm"}>
              <div class="space-y-3">
                <label class="block text-xs font-semibold text-[var(--text-secondary)]">Verification Token</label>
                <input
                  type="text"
                  value={emailToken()}
                  onInput={(e) => setEmailToken(e.currentTarget.value)}
                  placeholder="Paste verification token or code"
                  class="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                />
                <div class="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--border)]/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEmail}
                    class="px-4 py-2 rounded-xl bg-[var(--brand-600)] text-white text-xs font-bold"
                  >
                    Apply Email Change
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}
