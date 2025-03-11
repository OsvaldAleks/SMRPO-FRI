export function formatDate(dateString) {
    if (!dateString) 
        return "Invalid date";
    const [year, month, day] = dateString.split("-");
    return `${day}. ${month}. ${year}`;
}

export function validateStory(story){

    let valid = true

    if (!['must have', 'could have', 'should have', 'won\'t have this time'].includes(story.priority)) {
        valid = 'Priority must be one of: must have, could have, should have, or won\'t have this time.';
      return valid;
    }

    if (story.businessValue < 0 || story.businessValue > 100) {
        valid = 'Business value must be between 0 and 100.';
      return valid;
    }

    return valid;
  }
