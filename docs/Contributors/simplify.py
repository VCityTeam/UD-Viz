import typing

# The type for a developer's name (a developer possibly has many names)
ContributorKey = typing.AnyStr
# The first element of the list is the total number of commits and the remaining
# of the list holds the emails associated to the developers name
CommitNumberThenEmails = typing.List[str]
Contributor = typing.Dict[str, CommitNumberThenEmails]


def merge(
    contributors: Contributor,
    kept_dev_name: ContributorKey,
    suppressed_dev_name: ContributorKey,
):
    # First element of list is the number of commits
    suppressed_commits = contributors[suppressed_dev_name][0]
    suppressed_emails = contributors[suppressed_dev_name][1:]
    contributors[kept_dev_name][0] += suppressed_commits
    contributors[kept_dev_name].extend(suppressed_emails)
    del contributors[suppressed_dev_name]


def rename(
    contributors: Contributor,
    old_dev_name: ContributorKey,
    new_dev_name: ContributorKey,
):
    contributors[new_dev_name] = contributors.pop(old_dev_name)


if __name__ == "__main__":
    contributors: Contributor = dict()
    with open("raw_contributors.txt") as f:
        for line in f.readlines():
            split = line.split("\t")
            number_commits = int(split[0])
            # Split what remains with email delimiter
            resplit = split[1].split("<")
            dev_name = resplit[0].strip()  # Remove leading and trailing spaces
            email = resplit[1].rstrip(">\n")
            if dev_name not in contributors:
                contributors[dev_name] = [number_commits, email]
            else:
                contributors[dev_name][0] += number_commits
                contributors[dev_name].append(email)

    # Manual treatment of multiple entries
    rename(contributors, "AdrienHrdz", "Adrien HERNANDEZ")

    rename(contributors, "Antoine Webanck", "Antoine WEBANCK")

    rename(contributors, "Clement Chagnaud", "Clément CHAGNAUD")

    merge(contributors, "Clément COLIN", "clement")
    merge(contributors, "Clément COLIN", "clementcolin")
    merge(contributors, "Clément COLIN", "clement.colin")
    merge(contributors, "Clément COLIN", "Clement COLIN")
    merge(contributors, "Clément COLIN", "clement.colin69@gmail.com")

    merge(contributors, "Corentin GAUTIER", "Corentin")
    merge(contributors, "Corentin GAUTIER", "CorentinGaut")
    merge(contributors, "Corentin GAUTIER", "CorentinLIRIS")
    merge(contributors, "Corentin GAUTIER", "Gautier")
    merge(contributors, "Corentin GAUTIER", "Khadath")

    rename(contributors, "Diego Vinasco", "Diego VINASCO")
    merge(contributors, "Diego VINASCO", "Diego Vinasco-Alvarez")
    merge(contributors, "Diego VINASCO", "DiegoVinasco")

    rename(contributors, "Emmanuel Schmuck", "Emmanuel SCHMUCK")

    rename(contributors, "Eric Boix", "Eric BOIX")
    merge(contributors, "Eric BOIX", "EricBoix")
    merge(contributors, "Eric BOIX", "frogsapo")

    rename(contributors, "Eric Boucher", "Eric BOUCHER")
    merge(contributors, "Eric BOUCHER", "kbot22 / Eric")

    rename(contributors, "Frédéric Pedrinis", "Frédéric PEDRINIS")
    merge(contributors, "Frédéric PEDRINIS", "fpedrinis")

    rename(contributors, "Jaillot Vincent", "Jaillot VINCENT")
    merge(contributors, "Jaillot VINCENT", "jailln")

    merge(contributors, "John SAMUEL", "John Samuel")

    rename(contributors, "laurenttainturier", "Laurent Tainturier")

    rename(contributors, "lmarnat14@gmail.com", "Lorenzo MARNAT")
    merge(contributors, "Lorenzo MARNAT", "Lorenzo Marnat")
    merge(contributors, "Lorenzo MARNAT", "LorenzoMarnat")

    rename(contributors, "Livebardon", "Mathieu LIVEBARDON")
    merge(contributors, "Mathieu LIVEBARDON", "Mathieu")
    merge(contributors, "Mathieu LIVEBARDON", "Mathieu Livebardon")
    merge(contributors, "Mathieu LIVEBARDON", "mathieuLivebardon")

    rename(contributors, "Maxime Morel", "Maxime MOREL")
    merge(contributors, "Maxime MOREL", "MaximeMorel")

    rename(contributors, "sophiaab", "Sophia ABOUJOUDA")

    rename(contributors, "valentinMachado", "Valentin MACHADO")
    merge(contributors, "Valentin MACHADO", "valentin")
    merge(contributors, "Valentin MACHADO", "vmachado")
    merge(contributors, "Valentin MACHADO", "mache")
    merge(contributors, "Valentin MACHADO", "lamache")

    rename(contributors, "Valentin Rigolle", "Valentin RIGOLLE")

    rename(contributors, "Xoxo", "Homère Bourgeois")

    merge(contributors, "Yann-Laurick Abé", "yannlaurickabe")

    del contributors["dependabot[bot]"]  # Github bot

    # Remove contributors with a marginal contribution (in term of commits)
    # which is an obviously arguable practice

    print("######################### Dropping contributors with few commits")
    for dev_name in list(contributors):
        if contributors[dev_name][0] < 6:
            print(
                "WARNING: dropping contributor ",
                dev_name,
                " with ",
                contributors[dev_name][0],
                " commits.",
            )
            del contributors[dev_name]

    print("######################## Resulting contributors list:")
    for dev_name, values in sorted(contributors.items()):
        print(dev_name)

    print(
        "######################## Resulting contributors list with features:"
    )
    for dev_name, values in sorted(contributors.items()):
        commits = contributors[dev_name][0]
        emails = values[1:]
        print(dev_name, ": commits=", commits, ", emails=", emails)
