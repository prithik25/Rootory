"use client";
import { useState } from "react";
import {
  Leaf,
  Camera,
  ScanLine,
  CheckCircle2,
  ArrowRight,
  Info,
  Plus,
  Check,
  Sparkles,
  ImagePlus,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Field, Upload, Empty, Photo } from "./primitives";
import {
  type Plant,
  type Entry,
  type Post,
  type Listing,
  type Task,
  type Enquiry,
  type Profile,
  type Report,
  day,
  uid,
  pictures,
} from "@/lib/data";
const text = (f: FormData, k: string) => String(f.get(k) || "").trim();
function normalizeForm(form: HTMLFormElement) {
  // Do not save an earlier photo while its replacement is still decoding.
  if (form.querySelector('[data-upload-busy="true"]')) return false;
  for (const el of Array.from(form.elements)) {
    if (
      (el instanceof HTMLInputElement &&
        ["text", "search"].includes(el.type)) ||
      el instanceof HTMLTextAreaElement
    ) {
      el.value = el.value.trim();
    }
  }
  return form.reportValidity();
}
export function PlantForm({
  plant,
  onSave,
}: {
  plant?: Plant;
  onSave: (p: Plant) => void;
}) {
  const [image, setImage] = useState(plant?.image || "");
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: plant?.id || uid(),
          name: text(f, "name"),
          crop: text(f, "crop"),
          category: text(f, "category"),
          date: text(f, "date"),
          location: text(f, "location"),
          setting: text(f, "setting"),
          quantity: text(f, "quantity"),
          soil: text(f, "soil"),
          image,
          stage: text(f, "stage") as Plant["stage"],
        });
      }}
    >
      <Upload value={image} onChange={setImage} />
      <div className="form-grid">
        <Field label="Plant name">
          <input
            name="name"
            placeholder="e.g. My balcony tomatoes"
            defaultValue={plant?.name}
            maxLength={70}
            required
          />
        </Field>
        <Field label="Crop / species">
          <input
            name="crop"
            placeholder="e.g. Tomato"
            defaultValue={plant?.crop}
            maxLength={50}
            required
          />
        </Field>
        <Field label="Category">
          <select name="category" defaultValue={plant?.category || "Vegetable"}>
            <option>Vegetable</option>
            <option>Herb</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Planted on (optional)">
          <input
            name="date"
            type="date"
            max={day()}
            defaultValue={plant?.date || ""}
          />
        </Field>
        <Field label="Growing in">
          <select name="setting" defaultValue={plant?.setting || "Pot"}>
            {[
              "Pot",
              "Grow bag",
              "Raised bed",
              "Garden bed",
              "Field",
              "Greenhouse",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="How much are you growing?">
          <input
            name="quantity"
            placeholder="3 plants or 0.5 acre"
            defaultValue={plant?.quantity}
            maxLength={40}
            required
          />
        </Field>
        <Field label="Your growing space">
          <input
            name="location"
            placeholder="e.g. Terrace garden"
            defaultValue={plant?.location}
            maxLength={80}
          />
        </Field>
        <Field label="Growth stage">
          <select name="stage" defaultValue={plant?.stage || "Growing"}>
            <option>Growing</option>
            <option>Harvested</option>
          </select>
        </Field>
      </div>
      <Field label="Known soil type (optional)">
        <input
          name="soil"
          placeholder="Leave blank if unknown"
          defaultValue={plant?.soil === "Not recorded" ? "" : plant?.soil}
          maxLength={80}
        />
      </Field>
      <p className="form-hint">
        Soil information comes from your observations or soil test—not a photo
        estimate.
      </p>
      <button className="button primary full-width" type="submit">
        <Leaf size={17} />
        {plant ? "Save plant details" : "Add to my plants"}
      </button>
    </form>
  );
}
export function LogForm({
  plants,
  plantId,
  onSave,
}: {
  plants: Plant[];
  plantId?: string;
  onSave: (e: Entry) => void;
}) {
  const [image, setImage] = useState("");
  if (!plants.length)
    return (
      <Empty
        title="Add a plant first"
        body="Your updates will belong to its growing timeline."
      />
    );
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: uid(),
          plantId: text(f, "plant"),
          kind: text(f, "kind"),
          note: text(f, "note"),
          image,
          date: text(f, "date"),
        });
      }}
    >
      <div className="form-grid">
        <Field label="Plant">
          <select name="plant" defaultValue={plantId || plants[0]?.id}>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="What would you like to record?">
          <select name="kind">
            {[
              "Progress",
              "Watering",
              "Fertilizer",
              "Treatment",
              "Observation",
              "Harvest",
            ].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Your notes">
        <textarea
          name="note"
          placeholder="What changed? What did you notice?"
          maxLength={1500}
          rows={4}
          required
        />
      </Field>
      <Field label="Date">
        <input
          type="date"
          name="date"
          defaultValue={day()}
          max={day()}
          required
        />
      </Field>
      <Upload value={image} onChange={setImage} />
      <button className="button primary full-width">
        <Check size={17} />
        Save to timeline
      </button>
    </form>
  );
}
export function ReminderForm({
  plants,
  plantId,
  onSave,
}: {
  plants: Plant[];
  plantId?: string;
  onSave: (t: Task) => void;
}) {
  if (!plants.length)
    return (
      <Empty
        title="A plant comes first"
        body="Add a plant before creating its care reminders."
      />
    );
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: uid(),
          plantId: text(f, "plant"),
          title: text(f, "title"),
          date: text(f, "date"),
          done: false,
        });
      }}
    >
      <Field label="Plant">
        <select name="plant" defaultValue={plantId || plants[0]?.id}>
          {plants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Remind me to…">
        <input
          name="title"
          placeholder="e.g. Check soil moisture"
          maxLength={100}
          required
        />
      </Field>
      <Field label="On this date">
        <input
          type="date"
          name="date"
          defaultValue={day()}
          min={day()}
          required
        />
      </Field>
      <p className="form-hint">
        This appears in your care list. Push notifications are not connected.
      </p>
      <button className="button primary full-width">Add reminder</button>
    </form>
  );
}
export function PostForm({
  profile,
  onSave,
  initialBody = "",
  initialImage = "",
  initialCrop = "",
}: {
  profile: Profile;
  onSave: (p: Post) => void;
  initialBody?: string;
  initialImage?: string;
  initialCrop?: string;
}) {
  const [image, setImage] = useState(initialImage);
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: uid(),
          author: profile.name,
          own: true,
          location: profile.location.split(",")[0],
          crop: text(f, "crop"),
          type: text(f, "type"),
          body: text(f, "body"),
          image,
          date: new Date().toISOString(),
          likes: 0,
          liked: false,
          saved: false,
          comments: [],
        });
      }}
    >
      <div className="form-grid">
        <Field label="Post type">
          <select name="type">
            <option>Progress update</option>
            <option>Question</option>
            <option>Harvest story</option>
          </select>
        </Field>
        <Field label="Crop tag">
          <input
            name="crop"
            defaultValue={initialCrop}
            placeholder="Tomato, basil, mixed…"
            maxLength={40}
            required
          />
        </Field>
      </div>
      <Field label="Your story">
        <textarea
          name="body"
          defaultValue={initialBody}
          placeholder="Share a small win, a question, or something you learned…"
          rows={5}
          maxLength={2500}
          required
        />
      </Field>
      <Upload value={image} onChange={setImage} />
      <p className="form-hint">
        Only your approximate locality is included. This demo post stays on this
        device.
      </p>
      <button className="button primary full-width">
        Add to demo community <ArrowRight size={17} />
      </button>
    </form>
  );
}
export function ListingForm({
  profile,
  listing,
  onSave,
}: {
  profile: Profile;
  listing?: Listing;
  onSave: (l: Listing) => void;
}) {
  const [image, setImage] = useState(listing?.image || "");
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: listing?.id || uid(),
          title: text(f, "title"),
          category: text(f, "category") as Listing["category"],
          price: Number(f.get("price")),
          unit: text(f, "unit"),
          quantity: text(f, "quantity"),
          location: text(f, "location"),
          delivery: text(f, "delivery"),
          description: text(f, "description"),
          seller: profile.name,
          own: true,
          image,
          available: listing?.available ?? true,
          saved: listing?.saved ?? false,
        });
      }}
    >
      <Upload value={image} onChange={setImage} />
      <Field label="Listing title">
        <input
          name="title"
          defaultValue={listing?.title}
          placeholder="e.g. Fresh terrace-grown tomatoes"
          maxLength={80}
          required
        />
      </Field>
      <div className="form-grid">
        <Field label="Category">
          <select name="category" defaultValue={listing?.category || "Produce"}>
            <option>Produce</option>
            <option>Growing supplies</option>
          </select>
        </Field>
        <Field label="Available quantity">
          <input
            name="quantity"
            defaultValue={listing?.quantity}
            placeholder="e.g. 5 kg"
            maxLength={40}
            required
          />
        </Field>
        <Field label="Price (₹)">
          <input
            name="price"
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            defaultValue={listing?.price}
            placeholder="60"
            required
          />
        </Field>
        <Field label="Price per">
          <select name="unit" defaultValue={listing?.unit || "kg"}>
            {["kg", "bunch", "plant", "basket", "item", "bag"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </Field>
        <Field label="Approximate locality">
          <input
            name="location"
            defaultValue={listing?.location || profile.location.split(",")[0]}
            maxLength={80}
            required
          />
        </Field>
        <Field label="Collection">
          <select
            name="delivery"
            defaultValue={listing?.delivery || "Local pickup"}
          >
            <option>Local pickup</option>
            <option>Pickup or local delivery</option>
          </select>
        </Field>
      </div>
      <Field label="Tell buyers a little more">
        <textarea
          name="description"
          defaultValue={listing?.description}
          placeholder="Condition, availability, and collection details. Avoid personal contact information."
          rows={3}
          maxLength={1500}
          required
        />
      </Field>
      <p className="form-hint">
        This demo supports produce and ordinary growing supplies. No regulated
        pesticide sales or payments.
      </p>
      <button className="button primary full-width">
        {listing ? "Save changes" : "Create demo listing"}
      </button>
    </form>
  );
}
export function EnquiryForm({
  listing,
  onSave,
}: {
  listing: Listing;
  onSave: (e: Enquiry) => void;
}) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: uid(),
          listingId: listing.id,
          listingTitle: listing.title,
          body: text(f, "body"),
          date: new Date().toISOString(),
        });
      }}
    >
      <div className="enquiry-summary">
        <Photo src={listing.image} alt={listing.title} />
        <div>
          <strong>{listing.title}</strong>
          <p>
            ₹{listing.price} / {listing.unit} · {listing.location}
          </p>
        </div>
      </div>
      <Field label="Your enquiry">
        <textarea
          name="body"
          rows={4}
          defaultValue={`Hi! Is ${listing.title.toLowerCase()} still available? I’d like to know more about pickup.`}
          maxLength={1000}
          required
        />
      </Field>
      <div className="inline-note">
        <Info size={17} />
        <span>
          This saves an enquiry in your demo history. No message is sent to the
          sample seller.
        </span>
      </div>
      <button className="button primary full-width">
        Save enquiry locally
      </button>
    </form>
  );
}
export function ReportForm({
  location,
  onSave,
}: {
  location: string;
  onSave: (r: Report) => void;
}) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          id: uid(),
          crop: text(f, "crop"),
          location: text(f, "location"),
          body: text(f, "body"),
          date: new Date().toISOString(),
          status: "Pending",
        });
      }}
    >
      <Field label="Affected crop">
        <input name="crop" placeholder="e.g. Tomato" maxLength={50} required />
      </Field>
      <Field label="Approximate area">
        <input
          name="location"
          defaultValue={location.split(",")[0]}
          maxLength={80}
          required
        />
      </Field>
      <Field label="What did you observe?">
        <textarea
          name="body"
          placeholder="Describe symptoms and how many plants are affected. Do not claim a confirmed diagnosis."
          rows={4}
          maxLength={1500}
          required
        />
      </Field>
      <button className="button primary">Save for demo review</button>
    </form>
  );
}
export function ProfileForm({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (p: Profile) => void;
}) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalizeForm(e.currentTarget)) return;
        const f = new FormData(e.currentTarget);
        onSave({
          ...profile,
          name: text(f, "name"),
          location: text(f, "location"),
          role: text(f, "role"),
          bio: text(f, "bio"),
          care: f.has("care"),
          weather: f.has("weather"),
          community: f.has("community"),
        });
      }}
    >
      <div className="form-grid">
        <Field label="Display name">
          <input
            name="name"
            defaultValue={profile.name}
            maxLength={60}
            required
          />
        </Field>
        <Field label="I’m a…">
          <select name="role" defaultValue={profile.role}>
            <option>Home gardener</option>
            <option>Farmer</option>
            <option>Nursery grower</option>
          </select>
        </Field>
      </div>
      <Field label="Approximate location">
        <input
          name="location"
          defaultValue={profile.location}
          maxLength={100}
          required
        />
      </Field>
      <Field label="A little about your growing space">
        <textarea
          name="bio"
          defaultValue={profile.bio}
          rows={3}
          maxLength={500}
        />
      </Field>
      <h3 className="form-section-heading">Notification preferences</h3>
      <p className="form-hint">
        Preferences are saved for future delivery. They do not remove existing
        demo notifications.
      </p>
      {[
        ["care", "Care reminders", "Your own tasks and growing milestones."],
        ["weather", "Weather updates", "Forecast changes for your area."],
        [
          "community",
          "Community and crop reports",
          "Relevant updates from your growing circle.",
        ],
      ].map(([key, title, desc]) => (
        <label className="preference-row" key={key}>
          <span>
            <strong>{title}</strong>
            <small>{desc}</small>
          </span>
          <input
            type="checkbox"
            name={key}
            defaultChecked={Boolean(profile[key as keyof Profile])}
            role="switch"
          />
        </label>
      ))}
      <button className="button primary">Save profile</button>
    </form>
  );
}
export function PlantCheck({
  plants,
  initialPlant,
  onSave,
  onAddPlant,
}: {
  plants: Plant[];
  initialPlant?: string;
  onSave: (id: string, note: string, image: string, wholeImage: string) => void;
  onAddPlant: () => void;
}) {
  const [image, setImage] = useState("");
  const [whole, setWhole] = useState("");
  const [sample, setSample] = useState(false);
  const [selected, setSelected] = useState(initialPlant || plants[0]?.id || "");
  const [note, setNote] = useState("");
  const [since, setSince] = useState("Today");
  const [spread, setSpread] = useState("One plant");
  return (
    <div className="check-layout">
      <section className="panel check-main">
        <div className="check-steps">
          <span className="current">
            <b>1</b>Capture
          </span>
          <i />
          <span>
            <b>2</b>Add context
          </span>
          <i />
          <span>
            <b>3</b>Record
          </span>
        </div>
        {!plants.length ? (
          <Empty
            title="Let’s meet your plant first"
            body="A plant profile gives every observation a place to live."
            action={
              <button className="button primary" onClick={onAddPlant}>
                <Plus size={17} />
                Add a plant
              </button>
            }
          />
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!normalizeForm(e.currentTarget)) return;
              onSave(
                selected,
                `Symptoms: ${note.trim()}\nStarted: ${since}. Affected: ${spread}.\nPhotos saved as an observation. No AI assessment performed.`,
                image,
                whole,
              );
            }}
          >
            <div className="row between">
              <h2>Take a closer look.</h2>
              <span className="demo-pill">Frontend preview</span>
            </div>
            <p className="muted body-copy">
              Record what you see now, so you can compare what changes later.
            </p>
            <div className="check-photo-grid">
              <Upload
                label="Add a close-up photo"
                value={image}
                onChange={setImage}
              />
              <Upload
                label="Whole plant (optional)"
                value={whole}
                onChange={setWhole}
              />
            </div>
            <div className="photo-tips">
              <SunIcon />
              <span>Natural light</span>
              <Camera size={15} />
              <span>Clear focus</span>
              <Leaf size={15} />
              <span>No filters</span>
            </div>
            <Field label="Which plant?">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                required
              >
                {plants.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name} · {p.crop}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="What looks different?">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Yellowing on a few lower leaves"
                maxLength={1000}
                required
              />
            </Field>
            <div className="form-grid">
              <Field label="When did it start?">
                <select
                  value={since}
                  onChange={(e) => setSince(e.target.value)}
                >
                  <option>Today</option>
                  <option>2–3 days ago</option>
                  <option>About a week ago</option>
                  <option>Longer / not sure</option>
                </select>
              </Field>
              <Field label="How many plants?">
                <select
                  value={spread}
                  onChange={(e) => setSpread(e.target.value)}
                >
                  <option>One plant</option>
                  <option>A few plants</option>
                  <option>Most plants</option>
                  <option>Not sure</option>
                </select>
              </Field>
            </div>
            <div className="inline-note">
              <Info size={18} />
              <span>
                AI isn’t connected yet. Photos are kept on this device, and this
                form saves an observation without diagnosing it.
              </span>
            </div>
            <button
              className="button primary full-width"
              disabled={!image || !note.trim() || !selected}
            >
              <Check size={17} />
              Save observation
            </button>
          </form>
        )}
      </section>
      <aside>
        <section className="panel sample-result">
          <span className="scan-icon">
            <ScanLine size={26} />
          </span>
          <span className="category-label">A PREVIEW OF WHAT’S NEXT</span>
          <h2>
            Helpful answers.
            <br />
            Honest uncertainty.
          </h2>
          <p className="body-copy muted">
            The connected version will consider your photos, plant history, and
            symptoms together.
          </p>
          <button
            className="button secondary full-width"
            onClick={() => setSample(!sample)}
          >
            {sample ? "Hide example" : "Explore a sample result"}
            <ArrowRight size={16} />
          </button>
          {sample && (
            <div className="example-assessment">
              <span className="sample-tag">ILLUSTRATIVE · NOT YOUR PHOTO</span>
              <h3>More information needed</h3>
              <p>
                <strong>Example observation:</strong> Yellowing and brown
                patches on some tomato leaves.
              </p>
              <p>
                <strong>Possible explanations:</strong> Leaf damage, a leaf-spot
                disease, or growing-condition stress.
              </p>
              <p>
                <strong>Next check:</strong> Photograph the underside of an
                affected leaf. Check whether newer leaves show the same change.
              </p>
              <p className="form-hint">
                This canned example is independent of your uploaded image. It is
                not a diagnosis or treatment recommendation.
              </p>
            </div>
          )}
        </section>
        <section className="check-principles">
          <p>
            <ShieldCheck size={19} />
            <span>
              <strong>Your plant deserves context.</strong>
              <small>
                A photo can suggest possibilities; it cannot confirm every
                cause.
              </small>
            </span>
          </p>
          <p>
            <Leaf size={19} />
            <span>
              <strong>No invented soil scores.</strong>
              <small>Soil chemistry needs a suitable test.</small>
            </span>
          </p>
          <p>
            <CheckCircle2 size={19} />
            <span>
              <strong>Keep a record, spot a change.</strong>
              <small>
                Compare observations over time in your plant’s timeline.
              </small>
            </span>
          </p>
        </section>
      </aside>
    </div>
  );
}
function SunIcon() {
  return <Sparkles size={15} />;
}
